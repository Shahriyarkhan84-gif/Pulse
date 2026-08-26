import { io, type Socket } from "socket.io-client";
import { config } from "@/constants/config";
import { supabase } from "@/services/supabase/client";

let socket: Socket | null = null;

export async function connectChatSocket(): Promise<Socket> {
  if (socket?.connected) return socket;

  const { data } = await supabase.auth.getSession();
  socket = io(config.chatWsUrl, {
    transports: ["websocket"],
    auth: { token: data.session?.access_token },
  });

  return socket;
}

export function disconnectChatSocket() {
  socket?.disconnect();
  socket = null;
}
