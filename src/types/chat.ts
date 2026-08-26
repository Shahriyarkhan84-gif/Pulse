export interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  body: string;
  sentAt: string;
}

export interface ChatSocketEvents {
  "chat:message": (message: ChatMessage) => void;
  "chat:viewerCount": (count: number) => void;
}
