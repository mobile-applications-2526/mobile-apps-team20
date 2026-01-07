import { container } from '@/dependency_injection/container';
import { ChatMessage } from '@/domain/model/entities/chat/chat_message';
import { getErrorMessage } from '@/shared/utils/error_utils';
import { create } from 'zustand';


interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null
    // Pagination state
    page: number;
    hasMore: boolean;
    
    // Actions
    setMessages: (messages: ChatMessage[]) => void;
    prependMessages: (messages: ChatMessage[]) => void;
    addMessage: (message: ChatMessage) => void;
    setLoading: (loading: boolean) => void;
    incrementPage: () => void;
    setHasMore: (hasMore: boolean) => void;
    clearChat: () => void;
    
    // Async Action for fetching data
    fetchHistory: (chatId: string) => Promise<void>;
    sendLastMessageSeen: (chatId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    isLoading: false,
    page: 0,
    hasMore: true,
    error: null,

    setMessages: (messages) => set({ messages }),

    prependMessages: (incomingMessages) => set((state) => {
        const uniqueMessages = incomingMessages.filter(
            newMsg => !state.messages.some(existing => existing.id === newMsg.id)
        );
        return { messages: [...uniqueMessages, ...state.messages] };
    }),

    addMessage: (message) => set((state) => {
        if (state.messages.some(m => m.id === message.id)) {
            return state;
        }
        return { messages: [...state.messages, message] };
    }),

    setLoading: (isLoading) => set({ isLoading }),
    
    incrementPage: () => set((state) => ({ page: state.page + 1 })),
    
    setHasMore: (hasMore) => set({ hasMore }),
    
    clearChat: () => set({ 
        messages: [], 
        page: 0, 
        hasMore: true, 
        isLoading: false 
    }),

    fetchHistory: async (chatId: string) => {
        const { page, hasMore, isLoading } = get();

        // Guard clauses to prevent double fetching or fetching when done
        if (isLoading || (!hasMore && page !== 0)) return;

        set({ isLoading: true });

        try {
            const response = await container.chatRepository.getMessages(chatId, page);

            // Logic to determine if there are more pages
            if (page === 0) {
                // First load: replace everything
                get().setMessages(response.messages);
            } else {
                // Pagination: add to top
                get().prependMessages(response.messages);
            }

            set((state) => ({
                hasMore: response.hasMore,
                page: state.page + 1,
            }));

        } catch (error: unknown) {
            set({ error: getErrorMessage(error)})
        } finally {
            set({ isLoading: false });
        }
    },

    sendLastMessageSeen: async (chatId) => {
        const { messages } = get();

        if (!messages || messages.length === 0) return;

        // Get the most recent message (the last one in the array)
        const lastMessage = messages[messages.length - 1];

        try {
            await container.chatRepository.markAsRead(chatId, lastMessage.id);
        } catch (error) {
            // Fail silently or log (background operation)
            set({
                error: getErrorMessage(error)
            }) 
        }
    },
}));