import { randomUUID } from "crypto";
import { Router } from "express";
import { createRoom, createViewerToken, endRoom } from "../services/ingest/livekitClient";

export const streamsRouter = Router();

streamsRouter.get("/live", async (req, res) => {
  // TODO: return currently live streams from the database
  res.json([]);
});

streamsRouter.get("/:id", async (req, res) => {
  // TODO: replace with a real stream metadata lookup once a database is wired up
  const viewerIdentity = `viewer-${randomUUID()}`;
  const { livekitUrl, viewToken } = await createViewerToken(req.params.id, viewerIdentity);

  res.json({
    id: req.params.id,
    title: "Untitled stream",
    category: "general",
    viewerCount: 0,
    status: "live",
    host: { id: "unknown", username: "unknown", displayName: "Unknown" },
    livekitUrl,
    viewToken,
  });
});

streamsRouter.post("/", async (req, res) => {
  const { title } = req.body;
  // TODO: derive identity from the authenticated user once auth is wired up
  const hostIdentity = `host-${randomUUID()}`;
  const credentials = await createRoom(hostIdentity, title);
  res.json(credentials);
});

streamsRouter.post("/:id/stop", async (req, res) => {
  await endRoom(req.params.id);
  res.status(204).send();
});
