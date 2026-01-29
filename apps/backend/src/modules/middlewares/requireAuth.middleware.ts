import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { User } from "../models/user.Models.js";
import type { AuthJwtPayload } from "../../types/jwt.js";
import type { Request, Response, NextFunction } from "express";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Fix: Properly type the decoded token
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    
    // ✅ Type guard to ensure decoded is an object
    if (typeof decoded === 'string' || !decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const payload = decoded as AuthJwtPayload;

    const user = await User.findById(payload.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}