
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderProfilePicture?: string; // Match the URL field we added
  content: string;
  sentAt: string; // It comes as a String from JSON (ISO 8601), not a Date object
}