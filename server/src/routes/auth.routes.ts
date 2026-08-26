import { Router } from "express";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  // TODO: verify credentials against the user store, issue JWT access/refresh tokens
  res.status(501).json({ message: "not implemented" });
});

authRouter.post("/signup", async (req, res) => {
  // TODO: create user record, issue JWT access/refresh tokens
  res.status(501).json({ message: "not implemented" });
});
