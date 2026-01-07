import { ChatListResult } from "@/domain/model/dto/chat/chat_list_result";
import { UserChatListResult } from "@/domain/model/dto/chat/user_chat_list_result";

export interface ChatDatasource {
    getMessages(chatId: string, page: number): Promise<ChatListResult>;
    getUserChats(page: number): Promise<UserChatListResult>;
    markAsRead(chatId: string, messageId: string): Promise<void>;
}