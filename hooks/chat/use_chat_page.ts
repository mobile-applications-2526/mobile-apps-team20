import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useUserChatsStore } from "@/store/chat/use_user_chats_store";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { useUserChatListSocket } from "@/hooks/chat/use_user_chat_list_socket";

export const useChatsPage = () => {
    const router = useRouter();

    // --- Store Access ---
    const user = useUserAuthStore((state) => state.user);
    const { 
        chats, 
        isLoading, 
        fetchUserChats, 
        refreshUserChats,
        hasMore,
        unSeenMessagesCount 
    } = useUserChatsStore();

    // --- Side Effects ---
    // Initialize socket listener for the chat list updates
    useUserChatListSocket();

    // Reload list when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refreshUserChats();
        }, [])
    );

    // --- Handlers & Helpers ---
    const handleOpenChat = (
        chatId: string,
        eventName: string,
        eventId: string,
        eventImage?: string,
        currentUnseenCount?: number 
    ) => {
        router.push({
            pathname: "/(private)/chat/[id]",
            params: {
                id: chatId,
                name: eventName,
                image: eventImage,
                eventId: eventId,
                unseenCount: currentUnseenCount 
            },
        });
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return "";
        }
    };

    const handleLoadMore = () => {
        if (chats.length > 0 && hasMore && !isLoading) {
            fetchUserChats();
        }
    };

    return {
        // Data
        user,
        chats,
        isLoading,
        unSeenMessagesCount,
        
        // Actions
        handleOpenChat,
        handleLoadMore,
        formatTime,
        refreshUserChats // Exposed for manual pull-to-refresh if needed later
    };
};