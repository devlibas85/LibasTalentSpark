import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../database/models/user.Models.js";
import type { AuthJwtPayload } from "../types/jwt.js";
import type { Request, Response, NextFunction } from "express";
import { getCachedUser, setCachedUser } from "../common/cache.js";

/* ────────────────────────────────────────────────────────────
   requireAuth
   Reads cookie → verifies JWT → returns user (DB or cache).
   Cache TTL: 5 min. A deactivated account is blocked within 5 min.
   Note: we add `id` (string) alongside `_id` so that code which
   reads req.user?.id continues to work (lean objects have no id getter).
──────────────────────────────────────────────────────────── */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    if (typeof decoded === "string" || !decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const payload = decoded as AuthJwtPayload;
    const userId = payload.id;

    // Try cache first — avoids a DB round-trip on every protected request
    const cached = getCachedUser(userId);
    if (cached) {
      if (!cached.isActive) {
        return res.status(401).json({ success: false, message: "Account disabled" });
      }
      req.user = cached as any;
      return next();
    }

    // Cache miss — fetch from DB and warm the cache
    const user = await User.findById(userId).lean();

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Add string `id` alongside `_id` — lean objects don't have Mongoose's id getter,
    // but several controllers access req.user.id (string).
    const userWithId = { ...user, id: user._id.toString() };

    setCachedUser(userId, userWithId as unknown as Record<string, unknown>);
    req.user = userWithId as any;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

/* ────────────────────────────────────────────────────────────
   verifyToken
   Lightweight — only verifies JWT, no DB call.
   Use on /auth/me where the handler does its own DB lookup.
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
