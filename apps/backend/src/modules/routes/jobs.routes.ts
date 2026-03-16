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

      const skills = req.body.skills ? JSON.parse(req.body.skills) : [];

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
        jobData.jdPdf = `uploads/jd/${req.file.filename}`;
      }

      const job = await Job.create(jobData);

      return res.status(201).json(job);
    } catch (error) {
      console.error("❌ Create job failed:", error);
      return res.status(500).json({ error: "Failed to create job" });
    }
  },
);

router.get("/", async (_req, res) => {
  const jobs = await Job.find().populate("createdBy", "name email");
  res.json(jobs);
});

// GET single job by ID
router.get("/:id", async (req: Request, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json(job);
  } catch (error) {
    console.error("❌ Get job failed:", error);
    return res.status(500).json({ error: "Failed to fetch job" });
  }
});

// UPDATE job (edit)
router.put(
  "/:id",
  requireAuth,
  uploadJD.single("jdPdf"),
  async (req: Request, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

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

      const skills = req.body.skills ? JSON.parse(req.body.skills) : job.skills;

      // Track changes for edit history
      const changes: any = {};
      if (title !== job.title) changes.title = { old: job.title, new: title };
      if (department !== job.department)
        changes.department = { old: job.department, new: department };
      // ... add more field tracking as needed

      // Update fields
      if (title) job.title = title;
      if (department) job.department = department;
      if (location) job.location = location;
      if (jobType) job.jobType = jobType;
      if (experienceLevel) job.experienceLevel = experienceLevel;
      if (salaryMin !== undefined) job.salaryMin = salaryMin;
      if (salaryMax !== undefined) job.salaryMax = salaryMax;
      if (openings !== undefined) job.openings = openings;
      if (deadline !== undefined) job.deadline = deadline;
      if (description) job.description = description;
      if (responsibilities !== undefined)
        job.responsibilities = responsibilities;
      if (requirements !== undefined) job.requirements = requirements;
      if (skills) job.skills = skills;
      if (benefits !== undefined) job.benefits = benefits;
      if (status) job.status = status;

      // Update JD if new file uploaded
      if (req.file) {
        job.jdPdf = `uploads/jd/${req.file.filename}`;
      }

      // Check JD requirement for published jobs
      if (status === "published" && !job.jdPdf) {
        return res.status(400).json({
          error: "JD PDF is required to publish a job",
        });
      }

      // Add edit log
      if (Object.keys(changes).length > 0 && req.user) {
        job.editHistory.push({
          editedBy: req.user._id,
          editedAt: new Date(),
          changes,
        });
      }

      await job.save();

      return res.json(job);
    } catch (error) {
      console.error("❌ Update job failed:", error);
      return res.status(500).json({ error: "Failed to update job" });
    }
  },
);

// TOGGLE STATUS (pause/activate)
router.patch("/:id/status", requireAuth, async (req: Request, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Toggle logic: published <-> draft
    if (job.status === "published") {
      job.status = "draft";
    } else if (job.status === "draft") {
      // Check JD requirement before publishing
      if (!job.jdPdf) {
        return res.status(400).json({
          error: "JD PDF is required to publish a job",
        });
      }
      job.status = "published";
    } else if (job.status === "closed") {
      job.status = "published";
    }

    await job.save();
    return res.json(job);
  } catch (error) {
    console.error("❌ Toggle status failed:", error);
    return res.status(500).json({ error: "Failed to toggle status" });
  }
});

// DELETE job (soft delete)
router.delete("/:id", requireAuth, async (req: Request, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Soft delete
    job.deleted = true;
    job.deletedAt = new Date();
    if (req.user) {
      job.deletedBy = req.user._id;
    }

    await job.save();

    return res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("❌ Delete job failed:", error);
    return res.status(500).json({ error: "Failed to delete job" });
  }
});

router.patch("/:id/close", requireAuth, async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) return res.status(404).json({ error: "Job not found" });

  if (job.status === "closed") {
    return res.status(400).json({ error: "Job already closed" });
  }

  job.status = "closed";

  await job.save();

  res.json(job);
});

export default router;
