import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { Job } from "../database/models/jobs.Models.js";
import { Referral } from "../database/models/referral.Models.js";

export async function triggerAIAsync({
  referralId,
  jobId,
  resumePath,
}: {
  referralId: string;
  jobId: string;
  resumePath: string;
}) {
  console.log("🚀 AI ASYNC START");
  console.log("📌 referralId:", referralId);
  console.log("📌 jobId:", jobId);
  console.log("📌 resumePath:", resumePath);

  try {
    console.log("🔍 Fetching job for JD...");
    const job = await Job.findById(jobId);

    if (!job) {
      console.warn("⚠️ Job not found:", jobId);
      return;
    }

    if (!job.jdPdf) {
      console.warn("⚠️ Job has no JD PDF:", jobId);
      return;
    }

    console.log("📄 JD PDF path:", job.jdPdf);

    if (!fs.existsSync(job.jdPdf)) {
      console.error("❌ JD PDF file not found on disk:", job.jdPdf);
      return;
    }

    if (!fs.existsSync(resumePath)) {
      console.error("❌ Resume file not found on disk:", resumePath);
      return;
    }

    console.log("📦 Preparing FormData...");
    const formData = new FormData();
    formData.append("jd_file", fs.createReadStream(job.jdPdf));
    formData.append("resume_file", fs.createReadStream(resumePath));

    console.log("🌐 Sending PDFs to AI service...");
    console.log("🌐 AI_SERVICE_URL:", process.env.AI_SERVICE_URL);

    const response = await axios.post(process.env.AI_SERVICE_URL!, formData, {
      headers: formData.getHeaders(),
      timeout: 60000,
      maxBodyLength: Infinity,
    });

    console.log("✅ AI response received");
    console.log("📊 AI response data:", response.data);

    console.log("💾 Saving AI evaluation to referral...");
    const aiResult = response.data.aiEvaluation ?? response.data;

    console.log("🧠 Parsed AI result:", aiResult);

    if (!aiResult) {
      console.warn("⚠️ AI returned empty result");
      return;
    }

    await Referral.findByIdAndUpdate(
      referralId,
      {
        aiEvaluation: {
          ...aiResult,
          evaluatedAt: new Date(),
        },
      },
      { runValidators: true },
    );

    console.log("🎉 AI evaluation saved successfully");
  } catch (err: any) {
    console.error("❌ AI async failure");

    if (err.response) {
      console.error("📛 AI response status:", err.response.status);
      console.error("📛 AI response data:", err.response.data);
    } else if (err.request) {
      console.error("📛 No response from AI service");
    } else {
      console.error("📛 Error message:", err.message);
    }
  } finally {
    console.log("🏁 AI ASYNC END");
  }
}
