import type { Socket } from "socket.io-client";
import type { ChatMessage } from "@/types/chat";

export function sendChatMessage(socket: Socket, streamId: string, body: string) {
  socket.emit("chat:send", { streamId, body } satisfies Partial<ChatMessage> & { streamId: string });
}
