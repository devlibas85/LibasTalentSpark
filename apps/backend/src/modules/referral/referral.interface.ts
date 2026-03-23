import { Types } from "mongoose";

export interface IReferralAction {
  action:
    | "submitted"
    | "reviewed"
    | "interview_scheduled"
    | "rejected"
    | "hired";
  actionBy?: Types.ObjectId;
  actionAt?: Date;
  remarks?: string | null;
}

export interface IAIEvaluation {
  summary?: {
    score?: number;
    verdict?: string;
    confidence?: string;
  };
  skills?: {
    match_percentage?: number;
    matched?: string[];
    missing?: string[];
    critical_gap?: boolean;
  };
  experience?: {
    candidate_years?: number;
    required_years?: number;
    meets_requirement?: boolean;
    gap_months?: number;
    career_break_detected?: boolean;
    overlap_detected?: boolean;
    leadership_bonus_applied?: boolean;
    overqualified_flag?: boolean;
  };
  risk_flags?: string[];
  recommendation?: string;
  llm_explanation?: string;
  evaluatedAt?: Date;
}

export interface IReferral {
  _id: Types.ObjectId;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  relationship:
    | "friend"
    | "former_colleague"
    | "family"
    | "acquaintance"
    | "other";
  notes?: string | null; // Updated to allow null
  resume: string;
  job: Types.ObjectId;
  referredBy: Types.ObjectId;
  status:
    | "submitted"
    | "under_review"
    | "interview_scheduled"
    | "rejected"
    | "hired";

  interviewDate?: Date | null;
  aiEvaluation?: IAIEvaluation;
  actionHistory: IReferralAction[];
  deleted: boolean;
  deletedAt?: Date | null; // Updated to allow null
  deletedBy?: Types.ObjectId | null; // Updated to allow null
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateReferralDTO {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  relationship:
    | "friend"
    | "former_colleague"
    | "family"
    | "acquaintance"
    | "other";
  notes?: string | null; // Updated to allow null
  jobId: string;
  userId: string;
  resumePath: string;
}

export interface UpdateReferralStatusDTO {
  action: "reviewed" | "interview_scheduled" | "rejected" | "hired";
  remarks?: string | null; // Updated to allow null
  interviewDate?: string | null;
  userId: string;
}

export interface ReferralQueryParams {
  deleted?: boolean;
  referredBy?: string;
  job?: string;
  status?: IReferral["status"];
}
