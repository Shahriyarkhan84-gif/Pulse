import type { Server, Socket } from "socket.io";

/**
 * Chat and viewer presence run on a separate WebSocket gateway from the
 * media path — fan-out for many-to-many text is cheap and scales
 * independently of video ingest/transcode.
 */
export function registerChatGateway(io: Server) {
  const viewerCounts = new Map<string, number>();

  io.on("connection", (socket: Socket) => {
    socket.on("chat:join", ({ streamId }: { streamId: string }) => {
      socket.join(streamId);
      const count = (viewerCounts.get(streamId) ?? 0) + 1;
      viewerCounts.set(streamId, count);
      io.to(streamId).emit("chat:viewerCount", count);
    });

    socket.on("chat:leave", ({ streamId }: { streamId: string }) => {
      socket.leave(streamId);
      const count = Math.max((viewerCounts.get(streamId) ?? 1) - 1, 0);
      viewerCounts.set(streamId, count);
      io.to(streamId).emit("chat:viewerCount", count);
    });

    socket.on("chat:send", ({ streamId, body }: { streamId: string; body: string }) => {
      // TODO: authenticate socket.handshake.auth.token and attach real user info
      io.to(streamId).emit("chat:message", {
        id: `${Date.now()}-${Math.random()}`,
        streamId,
        userId: "anonymous",
        username: "anonymous",
        body,
        sentAt: new Date().toISOString(),
      });
    });
  });
}
