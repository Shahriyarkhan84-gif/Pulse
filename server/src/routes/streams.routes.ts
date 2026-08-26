import { randomUUID } from "crypto";
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { supabaseAdmin } from "../services/supabase/adminClient";
import { createRoom, createViewerToken, endRoom } from "../services/ingest/livekitClient";

export const streamsRouter = Router();

const HOST_SELECT = "id, username, display_name, avatar_url";

function toHostSummary(profile: { id: string; username: string; display_name: string; avatar_url: string | null }) {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url ?? undefined,
  };
}

streamsRouter.get("/live", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("streams")
    .select(`id, title, category, thumbnail_url, host:profiles!streams_host_id_fkey(${HOST_SELECT})`)
    .eq("status", "live")
    .order("started_at", { ascending: false });

  if (error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.json(
    data.map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      thumbnailUrl: row.thumbnail_url ?? undefined,
      viewerCount: 0, // tracked live in the chat gateway, not persisted here
      status: "live",
      host: toHostSummary(row.host),
    })),
  );
});

streamsRouter.get("/:id", async (req, res) => {
  const { data: stream, error } = await supabaseAdmin
    .from("streams")
    .select(`id, title, category, thumbnail_url, status, started_at, host:profiles!streams_host_id_fkey(${HOST_SELECT})`)
    .eq("id", req.params.id)
    .single();

  if (error || !stream) {
    res.status(404).json({ message: "stream not found" });
    return;
  }

  const viewerIdentity = `viewer-${req.user?.id ?? randomUUID()}`;
  const { livekitUrl, viewToken } = await createViewerToken(stream.id, viewerIdentity);

  res.json({
    id: stream.id,
    title: stream.title,
    category: stream.category,
    thumbnailUrl: stream.thumbnail_url ?? undefined,
    viewerCount: 0,
    status: stream.status,
    host: toHostSummary(stream.host as any),
    startedAt: stream.started_at,
    livekitUrl,
    viewToken,
  });
});

streamsRouter.post("/", requireAuth, async (req, res) => {
  const { title, category } = req.body as { title: string; category: string };
  const hostId = req.user!.id;

  const credentials = await createRoom(hostId, title);

  const { error } = await supabaseAdmin.from("streams").insert({
    id: credentials.streamId,
    host_id: hostId,
    title,
    category: category || "general",
    status: "live",
  });

  if (error) {
    await endRoom(credentials.streamId);
    res.status(500).json({ message: error.message });
    return;
  }

  res.json(credentials);
});

streamsRouter.post("/:id/stop", requireAuth, async (req, res) => {
  const { data: stream } = await supabaseAdmin.from("streams").select("host_id").eq("id", req.params.id).single();

  if (!stream || stream.host_id !== req.user!.id) {
    res.status(403).json({ message: "not the host of this stream" });
    return;
  }

  await supabaseAdmin
    .from("streams")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", req.params.id);
  await endRoom(req.params.id);

  res.status(204).send();
});
