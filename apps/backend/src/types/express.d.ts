import "express";
import type { UserDocument } from "../database/models/user.Models";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserDocument & { id?: string };
  }
}
