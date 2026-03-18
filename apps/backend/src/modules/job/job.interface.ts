import { Types } from "mongoose";

export interface IEditLog {
  editedBy: Types.ObjectId;
  editedAt: Date;
  changes: Record<string, any>;
}

export interface IJob {
  title: string;
  department: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  openings: number;
  deadline?: Date;
  description: string;
  responsibilities?: string;
  requirements?: string;
  skills: string[];
  benefits?: string;
  jdPdf?: string;
  createdBy: Types.ObjectId;
  status: "draft" | "published" | "closed";
  editHistory: IEditLog[];
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJobCreateDto {
  title: string;
  department: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  openings?: number;
  deadline?: Date;
  description: string;
  responsibilities?: string;
  requirements?: string;
  skills?: string[];
  benefits?: string;
  status?: "draft" | "published" | "closed";
}

export interface IJobUpdateDto {
  title?: string;
  department?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  openings?: number;
  deadline?: Date;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  skills?: string[];
  benefits?: string;
  status?: "draft" | "published" | "closed";
  jdPdf?: string;
}

export interface IJobFilters {
  status?: string;
  department?: string;
  jobType?: string;
  experienceLevel?: string;
  deleted?: boolean;
  createdBy?: string;
}
