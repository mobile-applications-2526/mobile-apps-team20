import { ChatMessage } from "./chat_message"

export interface UserChatsView {
    id: string
    eventId: string
    eventName: string
    lastMessage?: ChatMessage
    eventImage?: string
    unseenMessagesCount: number
}