import express, { type Request } from "express";
import { Job } from "../models/jobs.Models.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";
import { uploadJD } from "../middlewares/upload.middleware.js";
const router = express.Router();

router.post(
  "/",
  requireAuth,
  uploadJD.single("jdPdf"),
  async (req: Request, res) => {
    try {
      const {
        title,
        department,
        location,
        jobType,
        experienceLevel,
        salaryMin,
        salaryMax,
        openings,
        deadline,
        description,
        responsibilities,
        requirements,
        benefits,
        status,
      } = req.body;

      const skills = req.body.skills
        ? JSON.parse(req.body.skills)
        : [];

      if (!title || !department || !location || !description) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // 🔒 JD REQUIRED ONLY WHEN PUBLISHING
      if (status === "published" && !req.file) {
        return res.status(400).json({
          error: "JD PDF is required to publish a job",
        });
      }

      const jobData: any = {
        title,
        department,
        location,
        jobType,
        experienceLevel,
        salaryMin,
        salaryMax,
        openings,
        deadline,
        description,
        responsibilities,
        requirements,
        skills,
        benefits,
        status: status || "draft",
        createdBy: req.user._id,
      };

      if (req.file) {
        jobData.jdPdf = req.file.path;
      }

      const job = await Job.create(jobData);

      return res.status(201).json(job);
    } catch (error) {
      console.error("❌ Create job failed:", error);
      return res.status(500).json({ error: "Failed to create job" });
    }
  }
);



router.get("/", async (_req, res) => {
  const jobs = await Job.find().populate("createdBy", "name email");
  res.json(jobs);
});

export default router;