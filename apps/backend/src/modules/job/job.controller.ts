import type { Request, Response } from "express";
import { JobService } from "./job.service.js";
import type { IJobFilters } from "./job.interface.js";

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  createJob = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const job = await this.jobService.createJob(
        req.body,
        req.user._id.toString(),
        req.file,
      );

      return res.status(201).json(job);
    } catch (error: any) {
      console.error("❌ Create job failed:", error);
      const status = error.message.includes("required") ? 400 : 500;
      return res.status(status).json({
        success: false,
        error: error.message || "Failed to create job",
      });
    }
  };

  getAllJobs = async (req: Request, res: Response) => {
    try {
      const filters: IJobFilters = {};

      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.department)
        filters.department = req.query.department as string;
      if (req.query.jobType) filters.jobType = req.query.jobType as string;
      if (req.query.experienceLevel)
        filters.experienceLevel = req.query.experienceLevel as string;
      if (req.query.createdBy)
        filters.createdBy = req.query.createdBy as string;

      const jobs = await this.jobService.getAllJobs(filters);

      return res.json(jobs);
    } catch (error: any) {
      console.error("❌ Get jobs failed:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch jobs",
      });
    }
  };

  getJobById = async (req: Request, res: Response) => {
    try {
      const job = await this.jobService.getJobById(req.params.id as string);

      return res.json(job);
    } catch (error: any) {
      console.error("❌ Get job failed:", error);
      const status = error.message === "Job not found" ? 404 : 500;
      return res.status(status).json({
        success: false,
        error: error.message || "Failed to fetch job",
      });
    }
  };

  updateJob = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const job = await this.jobService.updateJob(
        req.params.id as string,
        req.body,
        req.user._id.toString(),
        req.file,
      );

      return res.json(job);
    } catch (error: any) {
      console.error("❌ Update job failed:", error);
      const status =
        error.message === "Job not found"
          ? 404
          : error.message.includes("required")
            ? 400
            : 500;

      return res.status(status).json({
        success: false,
        error: error.message || "Failed to update job",
      });
    }
  };

  toggleJobStatus = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const job = await this.jobService.toggleJobStatus(
        req.params.id as string,
        req.user._id.toString(),
      );

      return res.json(job);
    } catch (error: any) {
      console.error("❌ Toggle status failed:", error);
      const status =
        error.message === "Job not found"
          ? 404
          : error.message.includes("required")
            ? 400
            : 500;

      return res.status(status).json({
        success: false,
        error: error.message || "Failed to toggle job status",
      });
    }
  };

  closeJob = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const job = await this.jobService.closeJob(
        req.params.id as string,
        req.user._id.toString(),
      );

      return res.json(job);
    } catch (error: any) {
      console.error("❌ Close job failed:", error);
      const status =
        error.message === "Job not found"
          ? 404
          : error.message === "Job already closed"
            ? 400
            : 500;

      return res.status(status).json({
        success: false,
        error: error.message || "Failed to close job",
      });
    }
  };

  deleteJob = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await this.jobService.deleteJob(
        req.params.id as string,
        req.user._id.toString(),
      );

      return res.json({ message: "Job deleted successfully" });
    } catch (error: any) {
      console.error("❌ Delete job failed:", error);
      const status = error.message === "Job not found" ? 404 : 500;

      return res.status(status).json({
        success: false,
        error: error.message || "Failed to delete job",
      });
    }
  };

  restoreJob = async (req: Request, res: Response) => {
    try {
      const job = await this.jobService.restoreJob(req.params.id as string);

      return res.json({
        success: true,
        message: "Job restored successfully",
        data: job,
      });
    } catch (error: any) {
      console.error("❌ Restore job failed:", error);
      const status = error.message === "Job not found" ? 404 : 500;

      return res.status(status).json({
        success: false,
        error: error.message || "Failed to restore job",
      });
    }
  };

  getPublishedJobs = async (_req: Request, res: Response) => {
    try {
      const jobs = await this.jobService.getPublishedJobs();

      return res.json({
        success: true,
        count: jobs.length,
        data: jobs,
      });
    } catch (error: any) {
      console.error("❌ Get published jobs failed:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch published jobs",
      });
    }
  };

  getUserDrafts = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const jobs = await this.jobService.getUserDrafts(req.user._id.toString());

      return res.json({
        success: true,
        count: jobs.length,
        data: jobs,
      });
    } catch (error: any) {
      console.error("❌ Get user drafts failed:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user drafts",
      });
    }
  };

  getJobStats = async (_req: Request, res: Response) => {
    try {
      const stats = await this.jobService.getJobStats();

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("❌ Get job stats failed:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch job statistics",
      });
    }
  };
}
