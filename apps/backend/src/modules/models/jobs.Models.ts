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
      type: Object,
    },
  },
  { _id: false }
);

const jobSchema = new Schema(
  {
    // ===== CORE JOB DATA =====
    title: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    jobType: {
      type: String,
      required: true,
    },

    experienceLevel: {
      type: String,
      required: true,
    },

    salaryMin: {
      type: Number,
      min: 0,
    },

    salaryMax: {
      type: Number,
      min: 0,
    },

    openings: {
      type: Number,
      min: 1,
      default: 1,
    },

    deadline: {
      type: Date,
    },

    description: {
      type: String,
      required: true,
    },

    responsibilities: {
      type: String,
    },

    requirements: {
      type: String,
    },

    skills: {
      type: [String],
      default: [],
    },

    benefits: {
      type: String,
    },

    // ===== JD PDF (IMPORTANT) =====
    jdPdf: {
      type: String, // file path or URL
      validate: {
        validator: function (this: any, value: string) {
          // JD required only if job is published
          if (this.status === "published") {
            return !!value;
          }
          return true;
        },
        message: "JD PDF is required for published jobs",
      },
    },

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
      default: "draft",
    },

    // ===== AUDIT LOGS =====
    editHistory: {
      type: [editLogSchema],
      default: [],
    },

    // ===== SOFT DELETE =====
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
