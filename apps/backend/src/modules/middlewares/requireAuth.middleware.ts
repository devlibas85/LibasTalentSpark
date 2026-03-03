import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { User } from "../models/user.Models.js";
import type { AuthJwtPayload } from "../../types/jwt.js";
import type { Request, Response, NextFunction } from "express";

/* ────────────────────────────────────────────────────────────
   requireAuth
   Full middleware — reads cookie, verifies JWT, fetches user
   from DB and attaches to req.user. Use on protected routes
   that need the full user object (profile, jobs, etc.)
──────────────────────────────────────────────────────────── */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // ✅ Read from httpOnly cookie instead of Authorization header
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    if (typeof decoded === "string" || !decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const payload = decoded as AuthJwtPayload;

    const user = await User.findById(payload.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

/* ────────────────────────────────────────────────────────────
   verifyToken
   Lightweight middleware — only verifies the JWT from cookie,
   no DB call. Use on /auth/me where we do the DB call inside
   the route handler itself.
──────────────────────────────────────────────────────────── */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    if (typeof decoded === "string" || !decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = decoded as AuthJwtPayload;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token expired" });
  }
}
