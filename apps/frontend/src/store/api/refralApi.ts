  // store/referralApi.ts
  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

  export type ReferralStatus =
    | "submitted"
    | "under_review"
    | "interview_scheduled"
    | "rejected"
    | "hired";

    export interface AIEvaluation {
    keyword_score?: number;
    title_similarity?: number;
    skills_score?: number;
    exp_score?: number;
    jd_title?: number;
    resume_title?: number;
    jd_years?: number;
    resume_years?: number;
   matched_keywords?: string[];
  missing_keywords?: string[];
    evaluatedAt?: string;
  }


  export interface Referral {
    _id: string;
  atsScore?: number;
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
    };

    referredBy: {
      _id: string;
      name: string;
      email: string;
    };

    actionHistory?: Array<{
      action: string;
      actionBy: string;
      actionAt: string;
    }>;

      aiEvaluation?: AIEvaluation;

    deleted: boolean;
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

      getAllReferrals: builder.query<Referral[], void>({
        query: () => "/referrals",
        providesTags: ["Referrals"],
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
          // ✅ Create FormData INSIDE API layer
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

          // 🔍 LOG WHAT IS BEING SENT
          console.log("📤 Submitting referral payload:");
          for (const [key, value] of formData.entries()) {
            console.log(key, value);
          }

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
    useSubmitReferralMutation 
  } = referralApi;