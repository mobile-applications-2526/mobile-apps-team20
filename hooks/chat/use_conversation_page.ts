import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format, isToday, isYesterday, parseISO } from "date-fns";

import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { useUserProfileStore } from "@/store/user/use_user_profile_store";
import { useUserChatsStore } from "@/store/chat/use_user_chats_store";
import { useChatStore } from "@/store/chat/use_chat_messages_store";
import { useChatMessageSocket } from "@/hooks/chat/use_chat_messages_socket";
import { processImage } from "@/domain/infrastructure/mappers/user_profile_mapper";

export const useConversationPage = () => {
    const router = useRouter();
    
    // --- Params & Initialization ---
    const { id, name, image, eventId, unseenCount } = useLocalSearchParams(); 
    
    // Normalize params (expo-router can return string | string[])
    const chatId = Array.isArray(id) ? id[0] : id;
    const chatTitle = Array.isArray(name) ? name[0] : name; 
    const rawImage = Array.isArray(image) ? image[0] : (image ?? ""); 
    const eventChatImage = processImage(rawImage);
    const eventChatId = Array.isArray(eventId) ? eventId[0] : eventId; 

    // --- Global Store Access ---
    const user = useUserAuthStore((state) => state.user);
    const myProfile = useUserProfileStore((s) => s.profile);
    const { resetUnseenMessagesCount } = useUserChatsStore();
    const { 
        messages, 
        hasMore, 
        fetchHistory, 
        addMessage, 
        isLoading, 
        clearChat, 
        sendLastMessageSeen 
    } = useChatStore();

    // --- Local State & Refs ---
    const [inputText, setInputText] = useState("");
    const [newMessagesOffset, setNewMessagesOffset] = useState(0);
    
    // Freeze initial unseen count on mount for the banner logic
    const initialUnseenCount = useRef(Number(unseenCount) || 0);
    const flatListRef = useRef<FlatList>(null);

    // --- Socket Integration ---
    const { incomingMessage, sendMessage } = useChatMessageSocket(chatId);

    // Compute reversed messages for Inverted FlatList
    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

    // Mount/Unmount: Initialize and Cleanup
    useEffect(() => {
        clearChat();
        fetchHistory(chatId);

        return () => {
            resetUnseenMessagesCount(chatId);
            clearChat();
        };
    }, [chatId]);

    // Sync: Mark messages as seen when history loads
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            sendLastMessageSeen(chatId);
            resetUnseenMessagesCount(chatId); 
        }
    }, [isLoading, messages.length, chatId]);

    // Socket: Handle live incoming messages
    useEffect(() => {
        if (incomingMessage) {
            addMessage(incomingMessage);
            // Offset banner visually so it doesn't jump over new messages
            setNewMessagesOffset(prev => prev + 1);
            sendLastMessageSeen(chatId);
        }
    }, [incomingMessage]);

    // --- Handlers ---

    const handleSendMessage = () => {
        if (inputText.trim().length === 0) return;
        sendMessage(inputText);
        setInputText("");
        // Small delay to ensure the list renders the new item before scrolling
        setTimeout(() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
    };

    const handleHeaderPress = () => {
        router.push({
            pathname: "/(private)/event/[id]",
            params: { id: eventChatId }
        });
    };

    // --- Helpers ---
    
    const getDateLabel = (dateString: string) => {
        const date = parseISO(dateString);
        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";
        return format(date, "MMM d, yyyy");
    };

    return {
        // Data
        user,
        myProfile,
        chatTitle,
        eventChatImage,
        reversedMessages,
        isLoading,
        hasMore,
        
        // State
        inputText,
        initialUnseenCount: initialUnseenCount.current,
        newMessagesOffset,
        
        // Refs
        flatListRef,
        chatId, // Needed for dependencies in view if necessary

        // Actions
        setInputText,
        handleSendMessage,
        handleHeaderPress,
        fetchHistory,
        getDateLabel,
        router // Exposed for back button
    };
};