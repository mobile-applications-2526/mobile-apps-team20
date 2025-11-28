import { ChatListResult } from "@/domain/model/dto/chat/chat_list_result";

export interface ChatDatasource {
    getMessages(chatId: string, page: number): Promise<ChatListResult>;
}