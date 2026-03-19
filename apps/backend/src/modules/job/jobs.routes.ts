import express from "express";

import { JobController } from "./job.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.middleware.js";
import { requireHR } from "../../middlewares/role.middlewares.js";
import { jobRateLimiters } from "../../middlewares/rateLimiter.middleware.js";
import { uploadJD } from "../../middlewares/upload.middleware.js";

const router = express.Router();
const controller = new JobController();

// POST /api/jobs — Create job (HR only)
router.post(
  "/",
  requireAuth,
  requireHR,
  jobRateLimiters.create,
  uploadJD.single("jdPdf"),
  controller.createJob,
);

// GET /api/jobs — Get all jobs (public)
router.get("/", controller.getAllJobs);

// GET /api/jobs/:id — Get single job (public)
router.get("/:id", controller.getJobById);

// PUT /api/jobs/:id — Update job (HR only)
router.put(
  "/:id",
  requireAuth,
  requireHR,
  jobRateLimiters.update,
  uploadJD.single("jdPdf"),
  controller.updateJob,
);

// PATCH /api/jobs/:id/status — Toggle status (HR only)
router.patch("/:id/status", requireAuth, requireHR, controller.toggleJobStatus);

// PATCH /api/jobs/:id/close — Close job (HR only)
router.patch("/:id/close", requireAuth, requireHR, controller.closeJob);

// DELETE /api/jobs/:id — Soft delete (HR only)
router.delete("/:id", requireAuth, requireHR, controller.deleteJob);

export default router;
