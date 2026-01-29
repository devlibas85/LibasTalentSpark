// src/modules/models/user.Models.ts
import mongoose, { Schema, type Types } from "mongoose";

export interface UserSchemaType {
  email: string;
  name: string;
  role: "HR" | "EMPLOYEE";
  provider: "microsoft";
  providerId: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface UserDocument extends UserSchemaType {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserSchemaType>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["HR", "EMPLOYEE"],
      default: "EMPLOYEE",
    },
    provider: {
      type: String,
      enum: ["microsoft"],
      required: true,
    },
    providerId: { type: String, required: true },
    lastLoginAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const User = mongoose.model<UserSchemaType>("User", userSchema);