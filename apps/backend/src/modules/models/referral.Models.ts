import mongoose, { Schema, Types } from "mongoose";

const referralActionSchema = new Schema(
  {
    action: {
      type: String,
      enum: [
        "submitted",
        "reviewed",
        "interview_scheduled",
        "rejected",
        "hired",
      ],
      required: true,
    },
    actionBy: {
      type: Types.ObjectId,
      ref: "User", // HR / Recruiter
    },
    actionAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
    },
  },
  { _id: false }
);

const referralSchema = new Schema(
  {
    // ===== CANDIDATE DETAILS =====
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    candidatePhone: { type: String, required: true },

    relationship: {
      type: String,
      enum: ["friend", "former_colleague", "family", "acquaintance", "other"],
      required: true,
    },

    notes: { type: String },

    resume: {
      type: String, // file path
      required: true,
    },

    // ===== LINKED JOB =====
    job: {
      type: Types.ObjectId,
      ref: "Job",
      required: true,
    },

    // ===== REFERRER (VERY IMPORTANT) =====
    referredBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===== STATUS WORKFLOW =====
    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "interview_scheduled",
        "rejected",
        "hired",
      ],
      default: "submitted",
    },
aiEvaluation: {
  keyword_score: { type: Number },
  title_similarity: { type: Number },
  skills_score: { type: Number },
  exp_score: { type: Number },

  // filenames or titles
  jd_title: { type: String },
  resume_title: { type: String },

  // years of experience
  jd_years: { type: Number },
  resume_years: { type: Number },

  // keyword analysis
  matched_keywords: [{ type: String }],
  missing_keywords: [{ type: String }],

  // meta
  evaluatedAt: { type: Date },
},


    // ===== HR / SYSTEM LOGS =====
    actionHistory: [referralActionSchema],

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

export const Referral = mongoose.model("Referral", referralSchema);
