import { ChatMessage } from "../../entities/chat/ChatMessage"

export interface ChatListResult {
    events: ChatMessage[]
    hasMore: boolean
}