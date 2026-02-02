import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Job } from "@/types/job";

export const jobApi = createApi({
  reducerPath: "jobApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("auth_token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Job"],
  endpoints: (builder) => ({

    //  CREATE JOB
    createJob: builder.mutation<Job, FormData>({
      query: (data) => ({
        url: "/jobs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Job"],
    }),

    //  GET ALL JOBS
    getJobs: builder.query<Job[], void>({
      query: () => "/jobs",
      providesTags: ["Job"],
    }),

    //  GET JOB BY ID
    getJobById: builder.query<Job, string>({
      query: (id) => `/jobs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Job", id }],
    }),

    //  UPDATE JOB
    updateJob: builder.mutation<Job, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/jobs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Job", id },
        "Job",
      ],
    }),

    //  TOGGLE JOB STATUS (draft ↔ published)
    toggleJobStatus: builder.mutation<Job, string>({
      query: (id) => ({
        url: `/jobs/${id}/status`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Job", id },
        "Job",
      ],
    }),

    //  DELETE JOB
    deleteJob: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Job"],
    }),

  }),
});

export const {
  useCreateJobMutation,
  useGetJobsQuery,
  useGetJobByIdQuery,
  useUpdateJobMutation,
  useToggleJobStatusMutation,
  useDeleteJobMutation,
} = jobApi;
