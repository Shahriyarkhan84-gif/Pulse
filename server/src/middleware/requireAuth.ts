import type { NextFunction, Request, Response } from "express";
import { supabaseAuth } from "../services/supabase/authClient";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
  if (!token) {
    res.status(401).json({ message: "missing bearer token" });
    return;
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ message: "invalid or expired token" });
    return;
  }

  req.user = { id: data.user.id, email: data.user.email };
  next();
}
