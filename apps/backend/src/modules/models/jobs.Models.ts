import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    rawJDText: { type: String, required: true },

    // optional future fields
    parsed: { type: Object },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Job = mongoose.model("Job", jobSchema);
