// Job Type Definitions matching MongoDB schema
//frontend
export type JobStatus = "draft" | "published" | "closed";

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";

export type ExperienceLevel =
  | "Entry-level"
  | "Mid-level"
  | "Senior-level"
  | "Lead"
  | "Executive";

export type Department =
  | "Engineering"
  | "Design"
  | "Product"
  | "Marketing"
  | "Sales"
  | "Operations"
  | "HR"
  | "Finance";

export interface Job {
  _id: string; // MongoDB ObjectId as string
  title: string;
  department: Department | string;
  location: string;
  jobType: JobType | string;
  experienceLevel: ExperienceLevel | string;
  salaryMin: number;
  salaryMax: number;
  openings: number;
  deadline?: string | Date; // Can be ISO string or Date object
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
  benefits: string;
  jdPdf?: string; // File path
  createdBy: string; // MongoDB ObjectId as string
  status: JobStatus;
  deleted: boolean;
  editHistory: unknown[];
  createdAt: string | Date; // ISO string or Date object
  updatedAt: string | Date; // ISO string or Date object
}
