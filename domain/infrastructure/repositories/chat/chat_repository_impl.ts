import { ChatRepository } from "@/domain/repository/chat/chat_repository";
import { ChatDatasource } from "@/domain/datasources/chat/chat_datasource";
import { ChatListResult } from "@/domain/model/dto/chat/chat_list_result";
import { UserChatListResult } from "@/domain/model/dto/chat/user_chat_list_result";

export class ChatRepositoryImpl implements ChatRepository {
    private datasource: ChatDatasource;

    constructor(datasource: ChatDatasource) {
        this.datasource = datasource;
    }
    async getUserChats(page: number): Promise<UserChatListResult> {
        return await this.datasource.getUserChats(page)
    }

    async getMessages(chatId: string, page: number): Promise<ChatListResult> {
        return await this.datasource.getMessages(chatId, page);
    }

    async markAsRead(chatId: string, messageId: string): Promise<void> {
        await this.datasource.markAsRead(chatId, messageId);
    }
}