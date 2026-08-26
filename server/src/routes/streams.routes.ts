import { Router } from "express";
import { createRoom, endRoom } from "../services/ingest/mediaServerClient";

export const streamsRouter = Router();

streamsRouter.get("/live", async (req, res) => {
  // TODO: return currently live streams from the database
  res.json([]);
});

streamsRouter.get("/:id", async (req, res) => {
  // TODO: fetch stream metadata + resolve HLS playback URL from the media server
  res.status(404).json({ message: "not found" });
});

streamsRouter.post("/", async (req, res) => {
  const { title, category } = req.body;
  const credentials = await createRoom(title, category);
  res.json(credentials);
});

streamsRouter.post("/:id/stop", async (req, res) => {
  await endRoom(req.params.id);
  res.status(204).send();
});
