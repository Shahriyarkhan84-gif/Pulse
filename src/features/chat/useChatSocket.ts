import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { connectChatSocket, disconnectChatSocket } from "@/services/sockets/socketClient";
import type { ChatMessage } from "@/types/chat";
import { sendChatMessage } from "./chatApi";

export function useChatSocket(streamId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let mounted = true;

    connectChatSocket().then((socket) => {
      if (!mounted) return;
      socketRef.current = socket;
      socket.emit("chat:join", { streamId });
      socket.on("chat:message", (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
      });
      socket.on("chat:viewerCount", setViewerCount);
    });

    return () => {
      mounted = false;
      socketRef.current?.emit("chat:leave", { streamId });
      disconnectChatSocket();
    };
  }, [streamId]);

  const sendMessage = (body: string) => {
    if (socketRef.current) sendChatMessage(socketRef.current, streamId, body);
  };

  return { messages, viewerCount, sendMessage };
}
