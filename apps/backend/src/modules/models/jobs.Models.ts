import mongoose, { Schema, Types } from "mongoose";

const editLogSchema = new Schema(
  {
    editedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    editedAt: {
      type: Date,
      default: Date.now,
    },
    changes: {
      type: Object, //  snapshot
    },
  },
  { _id: false }
);

const jobSchema = new Schema(
  {
    // ===== CORE JOB DATA =====
    title: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true },
    experienceLevel: { type: String, required: true },

    salaryMin: { type: Number },
    salaryMax: { type: Number },
    openings: { type: Number },

    deadline: { type: Date },

    description: { type: String, required: true },
    responsibilities: { type: String },
    requirements: { type: String },
    skills: [{ type: String }],
    benefits: { type: String },

    // ===== OWNERSHIP =====
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===== STATUS =====
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
    },

    // ===== AUDIT LOGS =====
    editHistory: [editLogSchema],

    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, 
    versionKey: false,
  }
);

export const Job = mongoose.model("Job", jobSchema);
