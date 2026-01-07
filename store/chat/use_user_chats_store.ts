import { container } from '@/dependency_injection/container';
import { ChatMessage } from '@/domain/model/entities/chat/chat_message';
import { UserChatsView } from '@/domain/model/entities/chat/user_chat_view';
import { getErrorMessage } from '@/shared/utils/error_utils';
import { create } from 'zustand';
import { useUserAuthStore } from '../auth/use_auth_store';

interface UserChatsState {
    chats: UserChatsView[];
    unSeenMessagesCount: Record<string, number>; // Changed from Map to Record (Object)

    isLoading: boolean;
    error: string | null;
    
    // Pagination state
    page: number;
    hasMore: boolean;
    
    // Actions
    setChats: (chats: UserChatsView[]) => void;
    appendChats: (chats: UserChatsView[]) => void;
    setUnseenMessagesCount: (chatId: string, count: number) => void;
    resetUnseenMessagesCount: (chatId: string) => void;
    incrementUnseenMessagesCount: (chatId: string) => void;
    decrementUnseenMessagesCount: (chatId: string) => void;
    
    clearStore: () => void;
    
    // Async Actions
    fetchUserChats: () => Promise<void>;
    refreshUserChats: () => Promise<void>; 

    updateChatLastMessage: (message: ChatMessage) => void;
}

export const useUserChatsStore = create<UserChatsState>((set, get) => ({
    chats: [],
    unSeenMessagesCount: {}, // Initialize as an empty plain object
    isLoading: false,
    page: 0,
    hasMore: true,
    error: null,

    setChats: (chats) => set({ chats }),

    setUnseenMessagesCount: (chatId, count) => {
        // Create a shallow copy of the record and update the specific key
        set((state) => ({
            unSeenMessagesCount: {
                ...state.unSeenMessagesCount,
                [chatId]: count
            }
        }));
    },

    incrementUnseenMessagesCount: (chatId) => {
        const state = get();
        // Access property using bracket notation
        const currentCount = state.unSeenMessagesCount[chatId] || 0;

        state.setUnseenMessagesCount(chatId, currentCount + 1);
    },

    decrementUnseenMessagesCount: (chatId) => {
        const state = get();
        // Access property using bracket notation
        const currentCount = state.unSeenMessagesCount[chatId] || 0;
        
        // Prevent negative numbers
        const newCount = currentCount > 0 ? currentCount - 1 : 0;
        state.setUnseenMessagesCount(chatId, newCount);
    },

    resetUnseenMessagesCount: (chatId) => {
        get().setUnseenMessagesCount(chatId, 0);
    },

    appendChats: (incomingChats) => set((state) => {
        const uniqueChats = incomingChats.filter(
            newChat => !state.chats.some(existing => existing.id === newChat.id)
        );
        return { chats: [...state.chats, ...uniqueChats] };
    }),

    clearStore: () => set({ 
        chats: [], 
        page: 0, 
        hasMore: true, 
        isLoading: false,
        error: null,
        unSeenMessagesCount: {} // Reset to empty object
    }),

    // Standard pagination fetch
    fetchUserChats: async () => {
        const { page, hasMore, isLoading, appendChats, setChats } = get();

        if (isLoading || (!hasMore && page !== 0)) return;

        set({ isLoading: true });

        try {
            const response = await container.chatRepository.getUserChats(page);
            
            if (page === 0) {
                setChats(response.chats);
            } else {
                appendChats(response.chats);
            }

            // Initialize unseen messages count for new chats using Object spread
            const unseenRecord = { ...get().unSeenMessagesCount }; // Copy existing record
            
            response.chats.forEach((chat) => {
                unseenRecord[chat.id] = chat.unseenMessagesCount; // Assign value
            });

            set((state) => ({
                hasMore: response.hasMore,
                page: state.page + 1,
                unSeenMessagesCount: unseenRecord
            }));

        } catch (error: unknown) {
            set({ error: getErrorMessage(error) });
        } finally {
            set({ isLoading: false });
        }
    },

    refreshUserChats: async () => {
        const { isLoading } = get();
        
        if (isLoading) return; 

        set({ isLoading: true });

        try {
            const response = await container.chatRepository.getUserChats(0);

            // Initialize unseen messages count for new chats
            const unseenRecord: Record<string, number> = {}; // Start fresh for refresh
            
            response.chats.forEach((chat) => {
                unseenRecord[chat.id] = chat.unseenMessagesCount;
            });

            set({
                chats: response.chats, 
                hasMore: response.hasMore,
                page: 1, 
                error: null,
                unSeenMessagesCount: unseenRecord // Update record
            });

        } catch (error: unknown) {
            set({ error: getErrorMessage(error) });
        } finally {
            set({ isLoading: false });
        }
    },

   updateChatLastMessage: (newMessage) => {
    const state = get();
       
    const currentChats = state.chats;
    const chatIndex = currentChats.findIndex((c) => c.id === newMessage.chatId);

    if (chatIndex === -1) {
        state.fetchUserChats();
        return;
    }

    const chatToUpdate = {
      ...currentChats[chatIndex],
      lastMessage: newMessage, 
      updatedAt: newMessage.sentAt || new Date().toISOString(),      
    };

    const otherChats = currentChats.filter((c) => c.id !== newMessage.chatId);

    const user = useUserAuthStore.getState().user;

    if (newMessage.senderName !== user?.username) {
        console.log("Incrementing unseen for chat:", newMessage.chatId);
        state.incrementUnseenMessagesCount(newMessage.chatId);
    }
    
    set({
      chats: [chatToUpdate, ...otherChats],
    });

  },
}));