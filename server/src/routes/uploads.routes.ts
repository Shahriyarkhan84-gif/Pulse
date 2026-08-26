import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { createPresignedUpload } from "../services/storage/r2Client";

export const uploadsRouter = Router();

uploadsRouter.post("/presign", requireAuth, async (req, res) => {
  const { kind, contentType } = req.body as { kind: "avatar" | "thumbnail"; contentType: string };
  const result = await createPresignedUpload(kind, contentType);
  res.json(result);
});
