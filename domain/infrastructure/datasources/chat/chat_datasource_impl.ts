import { ChatDatasource } from "@/domain/datasources/chat/chat_datasource";
import { ChatListResult } from "@/domain/model/dto/chat/chat_list_result";
import { UserChatListResult } from "@/domain/model/dto/chat/user_chat_list_result";
import { ChatMessage } from "@/domain/model/entities/chat/chat_message";
import { UserChatsView } from "@/domain/model/entities/chat/user_chat_view";
import { PaginatedResponse } from "@/domain/model/shared/paginated_response";
import { ApiService } from "@/domain/services/api_service";

export class ChatDatasourceImpl implements ChatDatasource {
    private apiService: ApiService;
    
    // Default page sizes
    private readonly MESSAGE_PAGE_SIZE = 30;
    private readonly USER_CHAT_LIST_PAGE_SIZE = 10;

    constructor(apiService: ApiService) {
        this.apiService = apiService;
    }

    private chatMessagesFromPaginatedResponse(response: PaginatedResponse<ChatMessage>): ChatListResult {
        return {
            messages: response.content,
            hasMore: !response.last
        };
    }
    
    private userChatsFromPaginatedResponse(response: PaginatedResponse<UserChatsView>): UserChatListResult {
        return {
            chats: response.content,
            hasMore: !response.last 
        };
    }

    async markAsRead(chatId: string, messageId: string): Promise<void> {
        const endpoint = `/chat/${chatId}/mark-read`;
        await this.apiService.post<void>(endpoint, {
            messageId: messageId
        });
    }

    async getMessages(chatId: string, page: number): Promise<ChatListResult> {
        const endpoint = `/chat/${chatId}/messages`;

        const response = await this.apiService.get<PaginatedResponse<ChatMessage>>(endpoint, {
            size: this.MESSAGE_PAGE_SIZE,
            page: page,
        });
        
        return this.chatMessagesFromPaginatedResponse(response);
    }

    async getUserChats(page: number): Promise<UserChatListResult> {
        const endpoint = "/user/me/chats";

        const response = await this.apiService.get<PaginatedResponse<UserChatsView>>(endpoint, {
            page: page,
            size: this.USER_CHAT_LIST_PAGE_SIZE
        });

        return this.userChatsFromPaginatedResponse(response);
    }
}