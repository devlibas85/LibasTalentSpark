import express from "express";
import { JobController } from "./job.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.middleware.js";
import { uploadJD } from "../../middlewares/upload.middleware.js";

const router = express.Router();
const controller = new JobController();

// POST /api/jobs — Create job
router.post("/", requireAuth, uploadJD.single("jdPdf"), controller.createJob);

// GET /api/jobs — Get all jobs
router.get("/", controller.getAllJobs);

// GET /api/jobs/:id — Get single job
router.get("/:id", controller.getJobById);

// PUT /api/jobs/:id — Update job
router.put("/:id", requireAuth, uploadJD.single("jdPdf"), controller.updateJob);

// PATCH /api/jobs/:id/status — Toggle status
router.patch("/:id/status", requireAuth, controller.toggleJobStatus);

// PATCH /api/jobs/:id/close — Close job
router.patch("/:id/close", requireAuth, controller.closeJob);

// DELETE /api/jobs/:id — Soft delete
router.delete("/:id", requireAuth, controller.deleteJob);

export default router;
