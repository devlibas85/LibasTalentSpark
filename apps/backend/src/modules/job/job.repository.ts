import { Job } from "../../database/models/jobs.Models.js";
import type {
  IJob,
  IJobCreateDto,
  IJobUpdateDto,
  IJobFilters,
} from "./job.interface.js";
import { Types } from "mongoose";

export class JobRepository {
  async create(
    jobData: IJobCreateDto,
    createdBy: string,
    jdPdf?: string,
  ): Promise<IJob> {
    // Convert undefined to null for Mongoose
    const job = await Job.create({
      title: jobData.title,
      department: jobData.department,
      location: jobData.location,
      jobType: jobData.jobType,
      experienceLevel: jobData.experienceLevel,
      salaryMin: jobData.salaryMin ?? null,
      salaryMax: jobData.salaryMax ?? null,
      openings: jobData.openings || 1,
      deadline: jobData.deadline ?? null,
      description: jobData.description,
      responsibilities: jobData.responsibilities ?? null,
      requirements: jobData.requirements ?? null,
      skills: jobData.skills || [],
      benefits: jobData.benefits ?? null,
      status: jobData.status || "draft",
      createdBy: new Types.ObjectId(createdBy),
      jdPdf: jdPdf ?? null,
      editHistory: [],
      deleted: false,
    });

    // Convert null back to undefined for your interface
    const jobObject = job.toObject();
    return this.convertNullToUndefined(jobObject) as IJob;
  }

  async findAll(filters: IJobFilters = {}): Promise<IJob[]> {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.department) query.department = filters.department;
    if (filters.jobType) query.jobType = filters.jobType;
    if (filters.experienceLevel)
      query.experienceLevel = filters.experienceLevel;
    if (filters.createdBy)
      query.createdBy = new Types.ObjectId(filters.createdBy);

    const jobs = await Job.find(query)
      .populate("createdBy", "name email")

      .lean();

    // Convert null values to undefined for each job
    return jobs.map((job) => this.convertNullToUndefined(job)) as IJob[];
  }

  async findById(id: string): Promise<IJob | null> {
    const job = await Job.findById(id)
      .populate("createdBy", "name email")

      .lean();

    if (!job) return null;

    // Convert null values to undefined
    return this.convertNullToUndefined(job) as IJob;
  }

  async update(
    id: string,
    updateData: IJobUpdateDto,
    jdPdf?: string,
  ): Promise<IJob | null> {
    const updateFields: any = {};

    // Only set fields that are provided (convert undefined to null for Mongoose)
    if (updateData.title !== undefined) updateFields.title = updateData.title;
    if (updateData.department !== undefined)
      updateFields.department = updateData.department;
    if (updateData.location !== undefined)
      updateFields.location = updateData.location;
    if (updateData.jobType !== undefined)
      updateFields.jobType = updateData.jobType;
    if (updateData.experienceLevel !== undefined)
      updateFields.experienceLevel = updateData.experienceLevel;
    if (updateData.salaryMin !== undefined)
      updateFields.salaryMin = updateData.salaryMin ?? null;
    if (updateData.salaryMax !== undefined)
      updateFields.salaryMax = updateData.salaryMax ?? null;
    if (updateData.openings !== undefined)
      updateFields.openings = updateData.openings;
    if (updateData.deadline !== undefined)
      updateFields.deadline = updateData.deadline ?? null;
    if (updateData.description !== undefined)
      updateFields.description = updateData.description;
    if (updateData.responsibilities !== undefined)
      updateFields.responsibilities = updateData.responsibilities ?? null;
    if (updateData.requirements !== undefined)
      updateFields.requirements = updateData.requirements ?? null;
    if (updateData.skills !== undefined)
      updateFields.skills = updateData.skills;
    if (updateData.benefits !== undefined)
      updateFields.benefits = updateData.benefits ?? null;
    if (updateData.status !== undefined)
      updateFields.status = updateData.status;

    if (jdPdf) {
      updateFields.jdPdf = jdPdf;
    }

    const job = await Job.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true },
    )
      .populate("createdBy", "name email")
      .lean();

    if (!job) return null;

    // Convert null values to undefined
    return this.convertNullToUndefined(job) as IJob;
  }

  async addEditLog(
    id: string,
    editedBy: string,
    changes: Record<string, any>,
  ): Promise<void> {
    await Job.findByIdAndUpdate(id, {
      $push: {
        editHistory: {
          editedBy: new Types.ObjectId(editedBy),
          editedAt: new Date(),
          changes,
        },
      },
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<IJob | null> {
    const job = await Job.findByIdAndUpdate(
      id,
      {
        $set: {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: new Types.ObjectId(deletedBy),
        },
      },
      { new: true },
    ).lean();

    if (!job) return null;

    // Convert null values to undefined
    return this.convertNullToUndefined(job) as IJob;
  }

  async restore(id: string): Promise<IJob | null> {
    const job = await Job.findByIdAndUpdate(
      id,
      {
        $set: {
          deleted: false,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { new: true },
    ).lean();

    if (!job) return null;

    // Convert null values to undefined
    return this.convertNullToUndefined(job) as IJob;
  }

  async hardDelete(id: string): Promise<void> {
    await Job.findByIdAndDelete(id);
  }

  async updateStatus(
    id: string,
    status: "draft" | "published" | "closed",
  ): Promise<IJob | null> {
    const job = await Job.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true },
    ).lean();

    if (!job) return null;

    // Convert null values to undefined
    return this.convertNullToUndefined(job) as IJob;
  }

  async count(filters: IJobFilters = {}): Promise<number> {
    const query: any = { deleted: false };
    if (filters.status) query.status = filters.status;
    return Job.countDocuments(query);
  }

  async findPublished(): Promise<IJob[]> {
    const jobs = await Job.find({ status: "published", deleted: false })
      .populate("createdBy", "name email")

      .lean();

    // Convert null values to undefined for each job
    return jobs.map((job) => this.convertNullToUndefined(job)) as IJob[];
  }

  async findDrafts(createdBy: string): Promise<IJob[]> {
    const jobs = await Job.find({
      createdBy: new Types.ObjectId(createdBy),
      status: "draft",
      deleted: false,
    })
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    // Convert null values to undefined for each job
    return jobs.map((job) => this.convertNullToUndefined(job)) as IJob[];
  }

  // Helper method to convert null to undefined
  private convertNullToUndefined(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    const source = obj._doc || obj;
    const result: any = {};

    for (const [key, value] of Object.entries(source)) {
      if (value === null) {
        result[key] = undefined;
      } else if (value instanceof Date) {
        // ✅ Handle Date objects BEFORE the generic object check
        result[key] = value;
      } else if (
        typeof value === "object" &&
        typeof (value as any).toHexString === "function"
      ) {
        result[key] = (value as any).toString();
      } else if (Array.isArray(value)) {
        result[key] = value.map((item) =>
          typeof item === "object" && item !== null
            ? this.convertNullToUndefined(item)
            : item,
        );
      } else if (typeof value === "object") {
        result[key] = this.convertNullToUndefined(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}
