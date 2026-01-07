import { showErrorTop, showMessage } from "@/shared/utils/show_toast_message";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { useEventDetailStore } from "@/store/events/use_event_details_store";
import { useUserEventStore } from "@/store/events/user_events_store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STICKY_HEADER_THRESHOLD = 250;

export const useEventDetailPage = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    // --- Store Access ---
    const user = useUserAuthStore((state) => state.user);

    const { 
        event, 
        fetchEventById, 
        fetchEventParticipants, // Required to refresh the list and update UI state
        eventParticipants, 
        isLoadingEvent, 
        isLoadingParticipants 
    } = useEventDetailStore();

    const subscribeToEvent = useUserEventStore((state) => state.subscribeToEvent);
    const unSubscribeToEvent = useUserEventStore((state) => state.unSubscribeToEvent);
    const loadingSubscription = useUserEventStore((state) => state.loadingSubscribe);
    const errorSubscribe = useUserEventStore((state) => state.errorSubscribe);

    // --- Derived State ---
    // Determines if the current user is already a participant based on the fetched list.
    // This will automatically update when 'eventParticipants' changes.
    const isJoined = !!user && eventParticipants.some(
        (participant) => participant.profile.name === user.username
    );

    // --- Animation Logic ---
    const scrollY = useRef(new Animated.Value(0)).current;

    const headerOpacity = scrollY.interpolate({
        inputRange: [STICKY_HEADER_THRESHOLD - 50, STICKY_HEADER_THRESHOLD],
        outputRange: [0, 1],
        extrapolate: "clamp",
    });

    // --- Effects ---
    // Initial fetch of event data and participants
    useEffect(() => {
        if (id) {
            const eventId = Array.isArray(id) ? id[0] : id;
            fetchEventById(eventId);
            // Fetch participants immediately to determine initial 'isJoined' state
            fetchEventParticipants(eventId); 
        }
    }, [id, fetchEventById]); // fetchEventParticipants is stable

    // --- Action Handlers ---

    /**
     * Handles the subscription process.
     * Refreshes the participant list upon success to update the UI button.
     */
    const handleJoinEvent = async () => {
        if (loadingSubscription || !event) return;

        const success = await subscribeToEvent(event.id);

        if (success) {
            showMessage("Subscription completed!");

            // Navigate to the event chat list screen
            handleGoToChatListScreen();
            return;
        }

        showErrorTop("Error while subscribing: " + errorSubscribe);
    };

    /**
     * Handles unsubscription or event cancellation.
     * If the user is the organizer, the event is deleted and we navigate back.
     * If the user is a participant, we refresh the list to update the UI button.
     */
    const handleLeaveEvent = async () => {
        if (loadingSubscription || !event) return;

        // Pass organizerName to determine if this is a cancellation or an unsubscription
        const success = await unSubscribeToEvent(event.id, event.organiser.profile.name);

        if (success) {
            const isOrganizer = event.organiser.profile.name === user?.username;
            showMessage(isOrganizer ? "Event cancelled" : "Unsubscribed successfully.");

            // Navigate to the chat list screen
            handleGoToChatListScreen()

            return;
        }

        showErrorTop("Error processing request: " + errorSubscribe);
    };
    
    const handleProfileNavigation = (userId: string) => {
        router.push({
            pathname: "/(private)/user/[id]",
            params: { id: userId },
        });
    }
    const handleGoToChatListScreen = () => {
        router.push("/(private)/(tabs)/chats_screen")
    };

    /**
     * Triggers pagination for participants if not currently loading.
     */
    const handleLoadMore = () => {
        if (!event) return;
        if (!isLoadingParticipants) {
            fetchEventParticipants(event.id);
        }
    };

    return {
        // Data
        event,
        eventParticipants,
        isLoadingEvent,
        isLoadingParticipants,
        loadingSubscription,
        isJoined, 
        isOrganiser: user?.username === event?.organiser.profile.name,
        isMe: (username: string) => user?.username === username,
        
        // UI Helpers
        insets,
        scrollY,
        headerOpacity,

        // Actions
        handleJoinEvent,
        handleLeaveEvent,
        handleProfileNavigation,
        handleGoBack: () => router.back(),
        handleLoadMore,
        handleGoToChatListScreen
    };
};