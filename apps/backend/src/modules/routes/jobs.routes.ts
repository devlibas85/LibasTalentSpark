import express, { type Request } from "express";
import { Job } from "../models/jobs.Models.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, async (req: Request, res) => {
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
      skills,
      benefits,
    } = req.body;

    if (!title || !department || !location || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const job = await Job.create({
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
      createdBy: req.user._id, 
    });

    return res.status(201).json(job);
  } catch (error) {
    console.error("❌ Create job failed:", error);
    return res.status(500).json({ error: "Failed to create job" });
  }
});

router.get("/", async (_req, res) => {
  const jobs = await Job.find().populate("createdBy", "name email");
  res.json(jobs);
});

export default router;