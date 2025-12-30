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

export const useDiscoverPage = () => {

    // User Profile data for initial state
    const userProfile = useUserProfileStore((s) => s.profile);
    const fetchProfile = useUserProfileStore((s) => s.fetchProfile);
    const userCity = userProfile?.city || ""
    const interestFilter = useEventFilterStore((s) => s.interestFilter);

    const setInterest = useEventFilterStore((s) => s.setInterest);
    const createEvent = useUserEventStore((s) => s.createEvent);

    // --- Pagination Store Hooks ---
    const { events, loadNextPage, reset: refreshState, loading, hasMore } = useEventsStore();

    // --- Local Search State (Strategy Inputs) ---
    const [tagMode, setTagMode] = useState<FilterTag>(FilterTag.Location);
    const [location, setLocation] = useState(userCity);
    
    // CHANGED: Use DateMapper to ensure local date is used, not UTC
    const [date, setDate] = useState(DateMapper.toISOStringLocal(new Date()));
    
    // --- UI State ---
    const [showForm, setShowForm] = useState(false);
    const [activeFilterRender, setActiveFilterRender] = useState<(() => React.ReactNode) | null>(null);
    const [filterVisible, setFilterVisible] = useState(false);

    const emptyMessage =
       loading ? "Loading..." 
            : userCity === "" ?
              "Fill in your city at your profile or activate your location to see local events 📍"
              : "No events in " + userCity + " yet  😕"

    // Initial fetch for user profile
    useEffect(() => {
        if (!userProfile) {
            fetchProfile()
        }
    }, [userProfile, fetchProfile])

    // Listener for changes at the profile
    useEffect(() => {
        setLocation(userProfile?.city || "")
    }, [userProfile?.city])

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

    // Use Object.values logic we discussed earlier if InterestTag is a String Enum
    const filterButtons = Object.values(InterestTag).map((tag) => ({
        key: tag,
        label: tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase(),
    }));

    /**
     * Captures current state (Location/Date + Interest Tags) to decide Repository method.
     */
    const fetchStrategy = useCallback(
        async (repo: EventRepository, page: number) => {
            const tags = interestFilter === InterestTag.ALL ? undefined : [interestFilter];

            if (tagMode === FilterTag.Location) {
                return repo.getEventsByLocation(location, page, tags);
            } else {
                return repo.getEventsByDateAscending(date, page, tags);
            }
        },
        [tagMode, location, date, interestFilter]
    );

    // --- Effects ---
    // Trigger reload on filter change
    useEffect(() => {
        refreshState();
        loadNextPage(fetchStrategy);
    }, [fetchStrategy, refreshState, loadNextPage]);

    // --- Handlers ---
    const onFilterByInterestTagChanged = (tag: InterestTag) => {
        setInterest(tag);
    };

    const handleFormSubmit = (data: EventFormData) => {
        createEvent(mapEventFormToDTO(data));
        setShowForm(false);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadNextPage(fetchStrategy);
        }
    };

    const handleSelectFilter = (render: () => React.ReactNode) => {
        setActiveFilterRender(() => render);
        setFilterVisible(true);
    };

    const handleRefresh = () => {
        if (loading) return        
        refreshState()
        loadNextPage(fetchStrategy)
    }

    return {
        // Data
        events,
        userCity,
        loading,
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