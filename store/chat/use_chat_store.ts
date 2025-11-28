import { container } from '@/dependency_injection/container';
import { ChatMessage } from '@/domain/model/entities/chat/chat_message';
import { getErrorMessage } from '@/shared/utils/error_utils';
import { create } from 'zustand';


interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null
    lastId: string | null
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
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    isLoading: false,
    page: 0,
    hasMore: true,
    error: null,
    lastId: null,

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
        let { page, hasMore, isLoading, lastId } = get();
        
        // If it's the first state & chat id has changed
        if ( lastId && lastId != chatId) {
            get().clearChat()
            // Update local variables
            page = 0; 
            hasMore = true;
            isLoading = false;
        }

        // Guard clauses to prevent double fetching or fetching when done
        if (isLoading || (!hasMore && page !== 0)) return;

        set({ isLoading: true, lastId: chatId });

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
    }
}));