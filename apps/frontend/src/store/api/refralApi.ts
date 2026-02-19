import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type ReferralStatus =
  | "submitted"
  | "under_review"
  | "interview_scheduled"
  | "rejected"
  | "hired";

export type ReferralAction =
  | "submitted"
  | "reviewed"
  | "interview_scheduled"
  | "rejected"
  | "hired";

export interface ActionHistoryItem {
  action: ReferralAction;
  actionBy: {
    _id: string;
    name?: string;
    email?: string;
  } | string;
  actionAt: string;
  remarks?: string;
}

export interface AIEvaluation {
  // ── Nested structure (current backend schema) ──────────────────────────────
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

  // ── Flat / root-level fields (backward-compat & direct AI pipeline output) ─
  keyword_score?: number;
  title_similarity?: number;
  skills_score?: number;
  exp_score?: number;
  jd_title?: string;
  resume_title?: string;
  jd_years?: number;
  resume_years?: number;
  matched_keywords?: string[];
  missing_keywords?: string[];

  // ── Shared fields ──────────────────────────────────────────────────────────
  risk_flags?: string[];
  recommendation?: string;
  llm_explanation?: string;
  evaluatedAt?: string;
}

export interface Referral {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  relationship: string;
  notes?: string;
  resume: string;
  status: ReferralStatus;
  job: {
    _id: string;
    title: string;
    location: string;
    department?: string;
  };
  referredBy: {
    _id: string;
    name: string;
    email: string;
  };
  actionHistory?: ActionHistoryItem[];
  aiEvaluation?: AIEvaluation;
  deleted: boolean;
  deletedAt?: string;
  deletedBy?: {
    _id: string;
    name?: string;
    email?: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

export const referralApi = createApi({
  reducerPath: 'referralApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Referrals'],
  endpoints: (builder) => ({
    // Get user's referrals
    getMyReferrals: builder.query<Referral[], void>({
      query: () => "/referrals/my-referrals",
      providesTags: ["Referrals"],
    }),

    // Get all referrals (admin/HR)
    getAllReferrals: builder.query<Referral[], void>({
      query: () => "/referrals",
      providesTags: ["Referrals"],
    }),

    // Get single referral by ID
    getReferralById: builder.query<Referral, string>({
      query: (id) => `/referrals/${id}`,
      providesTags: ["Referrals"],
    }),

    // Update referral status
    updateReferral: builder.mutation<
      Referral,
      {
        id: string;
        data: {
          action: string;
          remarks?: string;
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/referrals/${id}/actions`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Referrals"],
    }),

    // Submit a new referral
    submitReferral: builder.mutation<
      unknown,
      {
        candidateName: string;
        candidateEmail: string;
        candidatePhone: string;
        relationship: string;
        notes: string;
        jobId: string;
        resumeFile?: File | null;
      }
    >({
      query: (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "resumeFile" && value instanceof File) {
              formData.append("resume", value);
            } else {
              formData.append(key, value as string);
            }
          }
        });

        return {
          url: "/referrals",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Referrals"],
    }),
  }),
});

export const {
  useGetMyReferralsQuery,
  useGetAllReferralsQuery,
  useGetReferralByIdQuery,
  useUpdateReferralMutation,
  useSubmitReferralMutation
} = referralApi;