
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderProfilePictureUrl: string; // Match the URL field we added
  content: string;
  sentAt: string; // It comes as a String from JSON (ISO 8601), not a Date object
  isMine: boolean;
}