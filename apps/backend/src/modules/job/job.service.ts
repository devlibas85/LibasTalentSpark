import { JobRepository } from "./job.repository.js";
import type {
  IJobCreateDto,
  IJobUpdateDto,
  IJobFilters,
} from "./job.interface.js";

export class JobService {
  private jobRepository: JobRepository;

  constructor() {
    this.jobRepository = new JobRepository();
  }

  async createJob(
    jobData: IJobCreateDto,
    createdBy: string,
    jdFile?: Express.Multer.File,
  ) {
    // Validate required fields
    if (
      !jobData.title ||
      !jobData.department ||
      !jobData.location ||
      !jobData.description
    ) {
      throw new Error("Missing required fields");
    }

    // Check JD requirement for published jobs
    if (jobData.status === "published" && !jdFile) {
      throw new Error("JD PDF is required to publish a job");
    }

    const jdPdf = jdFile ? `uploads/jd/${jdFile.filename}` : undefined;

    // Parse skills if they come as string
    let skills = jobData.skills;
    if (typeof jobData.skills === "string") {
      try {
        skills = JSON.parse(jobData.skills as unknown as string);
      } catch (e) {
        skills = [];
      }
    }

    const createData: IJobCreateDto = {
      ...jobData,
      skills: skills as string[],
    };

    return this.jobRepository.create(createData, createdBy, jdPdf);
  }

  async getAllJobs(filters: IJobFilters = {}) {
    return this.jobRepository.findAll(filters);
  }

  async getJobById(id: string) {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new Error("Job not found");
    }
    return job;
  }

  async updateJob(
    id: string,
    updateData: IJobUpdateDto,
    userId: string,
    jdFile?: Express.Multer.File,
  ) {
    const existingJob = await this.jobRepository.findById(id);
    if (!existingJob) {
      throw new Error("Job not found");
    }

    // Check JD requirement for publishing
    if (updateData.status === "published" && !existingJob.jdPdf && !jdFile) {
      throw new Error("JD PDF is required to publish a job");
    }

    // Parse skills if they come as string
    let skills = updateData.skills;
    if (updateData.skills && typeof updateData.skills === "string") {
      try {
        skills = JSON.parse(updateData.skills as unknown as string);
      } catch (e) {
        skills = [];
      }
    }

    const updatePayload: IJobUpdateDto = {
      ...updateData,
      skills: skills as string[],
    };

    const jdPdf = jdFile ? `uploads/jd/${jdFile.filename}` : undefined;

    // Track changes for edit history
    const changes = this.trackChanges(existingJob, updatePayload, jdPdf);

    // Update the job
    const updatedJob = await this.jobRepository.update(
      id,
      updatePayload,
      jdPdf,
    );

    // Add edit log if there were changes
    if (Object.keys(changes).length > 0 && updatedJob) {
      await this.jobRepository.addEditLog(id, userId, changes);
    }

    return updatedJob;
  }

  async toggleJobStatus(id: string, userId: string) {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new Error("Job not found");
    }

    let newStatus: "draft" | "published" | "closed";

    if (job.status === "published") {
      newStatus = "draft";
    } else if (job.status === "draft") {
      if (!job.jdPdf) {
        throw new Error("JD PDF is required to publish a job");
      }
      newStatus = "published";
    } else {
      // closed -> published
      newStatus = "published";
    }

    const updatedJob = await this.jobRepository.updateStatus(id, newStatus);

    // Log the status change

    return updatedJob;
  }

  async closeJob(id: string, userId: string) {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status === "closed") {
      throw new Error("Job already closed");
    }

    const updatedJob = await this.jobRepository.updateStatus(id, "closed");

    // Log the closure

    return updatedJob;
  }

  async deleteJob(id: string, userId: string) {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new Error("Job not found");
    }

    return this.jobRepository.softDelete(id, userId);
  }

  async restoreJob(id: string) {
    const job = await this.jobRepository.restore(id);
    if (!job) {
      throw new Error("Job not found");
    }
    return job;
  }

  async getPublishedJobs() {
    return this.jobRepository.findPublished();
  }

  async getUserDrafts(userId: string) {
    return this.jobRepository.findDrafts(userId);
  }

  async getJobStats() {
    const [total, published, draft, closed] = await Promise.all([
      this.jobRepository.count(),
      this.jobRepository.count({ status: "published" }),
      this.jobRepository.count({ status: "draft" }),
      this.jobRepository.count({ status: "closed" }),
    ]);

    return {
      total,
      published,
      draft,
      closed,
    };
  }

  private trackChanges(
    existingJob: any,
    updateData: IJobUpdateDto,
    jdPdf?: string,
  ) {
    const changes: Record<string, any> = {};

    const fieldsToTrack: Array<keyof IJobUpdateDto> = [
      "title",
      "department",
      "location",
      "jobType",
      "experienceLevel",
      "salaryMin",
      "salaryMax",
      "openings",
      "deadline",
      "description",
      "responsibilities",
      "requirements",
      "skills",
      "benefits",
      "status",
    ];

    fieldsToTrack.forEach((field) => {
      if (
        updateData[field] !== undefined &&
        updateData[field] !== existingJob[field]
      ) {
        changes[field] = { old: existingJob[field], new: updateData[field] };
      }
    });

    if (jdPdf && jdPdf !== existingJob.jdPdf) {
      changes.jdPdf = { old: existingJob.jdPdf, new: jdPdf };
    }

    return changes;
  }
}
