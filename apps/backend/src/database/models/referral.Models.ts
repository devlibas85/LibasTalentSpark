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
      ref: "User", 
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
  summary: {
    score: { type: Number },
    verdict: { type: String },
    confidence: { type: String },
  },

  skills: {
    match_percentage: { type: Number },
    matched: [{ type: String }],
    missing: [{ type: String }],
    critical_gap: { type: Boolean },
  },

  experience: {
    candidate_years: { type: Number },
    required_years: { type: Number },
    meets_requirement: { type: Boolean },
    gap_months: { type: Number },
    career_break_detected: { type: Boolean },
    overlap_detected: { type: Boolean },
    leadership_bonus_applied: { type: Boolean },
    overqualified_flag: { type: Boolean },
  },

  risk_flags: [{ type: String }],

  recommendation: { type: String },

  llm_explanation: { type: String },

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
