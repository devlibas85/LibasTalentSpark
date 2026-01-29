// src/types/express.d.ts
import "express";
import type { UserDocument } from "../modules/models/user.Models";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserDocument;
  }
}