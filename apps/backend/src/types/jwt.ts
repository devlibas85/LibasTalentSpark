import type { Types } from "mongoose";

export interface AuthJwtPayload {
  id:  string;
  email: string;
  name: string;
  role: "HR" | "EMPLOYEE";
  iat?: number;
  exp?: number;
}