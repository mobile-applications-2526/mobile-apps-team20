import { EventFormData } from "@/components/events/event_form";
import { mapEventFormToDTO } from "@/domain/infrastructure/mappers/event_mapper";
import { FilterTag } from "@/domain/model/enums/filter_tag";
import { InterestTag } from "@/domain/model/enums/interest_tag";
import { EventRepository } from "@/domain/repository/events/event_repository";
import { useEventFilter } from "@/hooks/events/use_event_filter";
import { DateMapper } from "@/shared/utils/date_mapper";
import { useEventFilterStore } from "@/store/events/use_event_filter_store";
import { useEventsStore } from "@/store/events/use_events_store_factory";
import { useUserEventStore } from "@/store/events/user_events_store";
import { useUserProfileStore } from "@/store/user/use_user_profile_store";
import { useCallback, useEffect, useState } from "react";
import { useUserLocation } from "../location/use_user_location";

export const useDiscoverPage = () => {

    // --- User Profile & Global Filter State ---
    const userProfile = useUserProfileStore((s) => s.profile);
    const fetchProfile = useUserProfileStore((s) => s.fetchProfile);
    const interestFilter = useEventFilterStore((s) => s.interestFilter);

    const setInterest = useEventFilterStore((s) => s.setInterest);
    const createEvent = useUserEventStore((s) => s.createEvent);

    // --- Pagination Store Hooks ---
    const { events, loadNextPage, reset: refreshState, loadingEvents: loadingEvents, hasMore } = useEventsStore();

    // --- Local Search State (Strategy Inputs) ---
    const [tagMode, setTagMode] = useState<FilterTag>(FilterTag.Location);
    const [date, setDate] = useState(DateMapper.toISOStringLocal(new Date()));

    // Load user location
    const { currentCity, loadingLocation, refreshLocation } = useUserLocation();
    const [location, setLocation] = useState<string | null>(currentCity ?? userProfile?.city ?? null);
    
    // --- UI State ---
    const [showForm, setShowForm] = useState(false);
    const [activeFilterRender, setActiveFilterRender] = useState<(() => React.ReactNode) | null>(null);
    const [filterVisible, setFilterVisible] = useState(false);

    const emptyMessage =
        loadingLocation ? "Updating location..."
            : loadingEvents ? "Loading..." 
            : !location ?
              "Fill in your city at your profile or activate your location to see local events 📍"
              : "No events in " + location + " yet 😕"

    // Initial fetch for user profile
    useEffect(() => {
        if (!userProfile) {
            fetchProfile()
        }
    }, [userProfile, fetchProfile])

    useEffect(() => {
        if (loadingLocation) return;

        if (currentCity && !location) {
            setLocation(currentCity);
        }
    }, [currentCity, loadingLocation, location])

    // Update location when profile changes
    useEffect(() => {
        if (loadingLocation) return;

        // If no location from other sources, use profile city
        if (userProfile?.city && !location && !currentCity) {
            setLocation(userProfile.city);
        }
    }, [userProfile?.city, currentCity, location, loadingLocation])

    // --- Helpers ---
    const closeFilter = () => {
        setFilterVisible(false);
        setActiveFilterRender(null);
    };

    // --- Filter Menu Configuration ---
    const filterOptions = useEventFilter({
        onClose: closeFilter,
        onLocationChange: setLocation,
        onDateChange: setDate,
        onModeChange: setTagMode,
    });

    const filterButtons = Object.values(InterestTag).map((tag) => ({
        key: tag,
        label: tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase(),
    }));

    /**
     * Decides which repository method to use based on current state (Location/Date + Tags).
     */
    const fetchStrategy = useCallback(
        async (repo: EventRepository, page: number) => {
            const tags = interestFilter === InterestTag.ALL ? undefined : [interestFilter];

            if (tagMode === FilterTag.Location) {
                // Return empty if no location is set to prevent errors
                if (!location) return { events: [], hasMore: false };

                return repo.getEventsByLocation(location, page, tags);
            } else {
                return repo.getEventsByDateAscending(date, page, tags);
            }
        },
        [tagMode, location, date, interestFilter]
    );

    // Trigger reload on filter change (Location, Date, Interest, Mode)
    useEffect(() => {
        // Reset state (page 1, clear list)
        refreshState();
        // Load first page with the new strategy
        loadNextPage(fetchStrategy);
        
    }, [fetchStrategy]); 

    // --- Handlers ---
    const onFilterByInterestTagChanged = (tag: InterestTag) => {
        setInterest(tag);
    };

    const handleFormSubmit = (data: EventFormData) => {
        const formData = new FormData();

        // PREPARE JSON: Map form data to DTO structure
        const eventDto = mapEventFormToDTO(data); 
        formData.append("data", JSON.stringify(eventDto));

        // PREPARE IMAGE:
        if (data.image) {
            const uri = data.image;
            const filename = uri.split('/').pop() || "image.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append("image", {
                uri: uri,
                name: filename,
                type: type,
            } as any);
        }

        // Pass the FormData object to your store
        createEvent(formData);
        setShowForm(false);
    };

    const handleLoadMore = () => {
        if (!loadingEvents && hasMore) {
            loadNextPage(fetchStrategy);
        }
    };

    const handleSelectFilter = (render: () => React.ReactNode) => {
        setActiveFilterRender(() => render);
        setFilterVisible(true);
    };

    // Specific Pull-to-refresh logic
    const handleRefresh = async () => {
       if (loadingEvents || loadingLocation) return;

       // Refresh user location
       const detectedCity = await refreshLocation();

       const shouldUpdateLocation = tagMode === FilterTag.Location 
                                    && detectedCity !== undefined 
                                    && detectedCity !== location;
       
       if (shouldUpdateLocation) {
           // This state change will trigger the main useEffect to fetch data.
           // We return early to avoid a double fetch.
           setLocation(detectedCity);
       } else {
           // Location didn't change (or we are in Date mode), so the useEffect won't run.
           // We must fetch manually.
           refreshState();
           await loadNextPage(fetchStrategy);
       }
    }

    return {
        // Data
        events,
        location,
        loadingEvents,
        interestFilter,
        filterButtons,
        filterOptions,
        emptyMessage,
        
        // UI State
        showForm,
        filterVisible,
        activeFilterRender,

        // Actions
        setShowForm,
        closeFilter,
        onFilterByInterestTagChanged,
        handleFormSubmit,
        handleLoadMore,
        handleSelectFilter,
        handleRefresh
    };
};