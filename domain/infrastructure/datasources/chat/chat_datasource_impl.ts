import { ChatDatasource } from "@/domain/datasources/chat/chat_datasource";
import { ChatListResult } from "@/domain/model/dto/chat/chat_list_result";
import { ApiService } from "@/domain/services/api_service";

export class ChatDatasourceImpl implements ChatDatasource {
    private apiService: ApiService;
    
    constructor(apiService: ApiService) {
        this.apiService = apiService;
    }
    
    PAGE_SIZE = 30

    async getMessages(chatId: string, page: number): Promise<ChatListResult> {
        // Endpoint structure based on your Spring Boot controllers
        const endpoint = `/event/chat/${chatId}/messages`;

        const response = await this.apiService.get<ChatListResult>(endpoint,{
            size: this.PAGE_SIZE,
            page: page,
            chatId: chatId
        });
        
        return response;
    }
}