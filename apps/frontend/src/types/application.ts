import type { Job } from "./job";

export type ApplicationStatus =
  | "Pending"
  | "Under Review"
  | "Interview Scheduled"
  | "Interviewing"
  | "Hired"
  | "Rejected"
  | "Accepted";

export interface Application {
  _id: string;
  status: ApplicationStatus;

  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;

  jobTitle?: string;
  job?: Job; // 👈 IMPORTANT (your Job type)

  relationship?: string;
  notes?: string;
  resumeFile?: string;

  createdAt: string;
  submittedDate?: string;
}
