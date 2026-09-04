import type { Server, Socket } from "socket.io";
import { supabaseAuth } from "../services/supabase/authClient";
import { supabaseAdmin } from "../services/supabase/adminClient";

interface ChatIdentity {
  userId: string;
  username: string;
}

/**
 * Chat and viewer presence run on a separate WebSocket gateway from the
 * media path — fan-out for many-to-many text is cheap and scales
 * independently of video ingest/transcode.
 */
export function registerChatGateway(io: Server) {
  const viewerCounts = new Map<string, number>();
  const identities = new Map<string, ChatIdentity>(); // socket.id -> chat identity

  io.on("connection", (socket: Socket) => {
    // Register listeners synchronously so a "chat:join"/"chat:send" sent
    // right after connecting is never dropped while identity resolves —
    // chat:send already falls back to "anonymous" if it arrives first.
    resolveIdentity(socket).then((identity) => identities.set(socket.id, identity));
    socket.on("disconnect", () => identities.delete(socket.id));

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
      const identity = identities.get(socket.id) ?? { userId: "anonymous", username: "anonymous" };
      io.to(streamId).emit("chat:message", {
        id: `${Date.now()}-${Math.random()}`,
        streamId,
        userId: identity.userId,
        username: identity.username,
        body,
        sentAt: new Date().toISOString(),
      });
    });
  });
}

async function resolveIdentity(socket: Socket): Promise<ChatIdentity> {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) return { userId: "anonymous", username: "anonymous" };

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return { userId: "anonymous", username: "anonymous" };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("username")
    .eq("id", data.user.id)
    .single();

  return { userId: data.user.id, username: profile?.username ?? "anonymous" };
}
