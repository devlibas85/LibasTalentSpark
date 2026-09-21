import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { Job } from "../database/models/jobs.Models.js";
import { Referral } from "../database/models/referral.Models.js";
import { env } from "../config/env.js";

export async function triggerAIAsync({
  referralId,
  jobId,
  resumePath,
}: {
  referralId: string;
  jobId: string;
  resumePath: string;
}) {
  try {
    const job = await Job.findById(jobId);

    if (!job) {
      console.warn("⚠️ AI eval skipped — job not found:", jobId);
      return;
    }

    if (!job.jdPdf) {
      console.warn("⚠️ AI eval skipped — job has no JD PDF:", jobId);
      return;
    }

    if (!fs.existsSync(job.jdPdf)) {
      console.error("❌ AI eval aborted — JD PDF missing on disk:", job.jdPdf);
      return;
    }

    if (!fs.existsSync(resumePath)) {
      console.error("❌ AI eval aborted — resume missing on disk:", resumePath);
      return;
    }

    const formData = new FormData();
    formData.append("jd_file", fs.createReadStream(job.jdPdf));
    formData.append("resume_file", fs.createReadStream(resumePath));

    const response = await axios.post(env.aiServiceUrl, formData, {
      headers: formData.getHeaders(),
      timeout: 300_000,
      maxBodyLength: Infinity,
    });

    const aiResult = response.data.aiEvaluation ?? response.data;

    if (!aiResult) {
      console.warn("⚠️ AI returned empty result for referral:", referralId);
      return;
    }

    await Referral.findByIdAndUpdate(
      referralId,
      { aiEvaluation: { ...aiResult, evaluatedAt: new Date() } },
      { runValidators: true },
    );

    console.log("✅ AI evaluation saved for referral:", referralId);
  } catch (err: any) {
    if (err.response) {
      console.error("❌ AI service error", err.response.status, err.response.data);
    } else if (err.request) {
      console.error("❌ AI service unreachable");
    } else {
      console.error("❌ AI eval error:", err.message);
    }
  }
}
