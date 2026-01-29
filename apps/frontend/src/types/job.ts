export type JobStatus = "draft" | "published" | "closed";

export interface Job {
  _id: string;
  title: string;
  department: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  status: JobStatus;
  openings?: number;
  deadline?: string;
  createdAt: string;
}
