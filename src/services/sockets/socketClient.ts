import { io, type Socket } from "socket.io-client";
import { config } from "@/constants/config";
import { getAccessToken } from "@/services/storage/secureStorage";

let socket: Socket | null = null;

export async function connectChatSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  const token = await getAccessToken();
  socket = io(config.chatWsUrl, {
    transports: ["websocket"],
    auth: { token },
  });

  return socket;
}

export function disconnectChatSocket() {
  socket?.disconnect();
  socket = null;
}
