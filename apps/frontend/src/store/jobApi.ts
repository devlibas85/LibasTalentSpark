
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { JobFormState } from "./jobFormSlice";

export const jobApi = createApi({
  reducerPath: "jobApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      // ✅ Changed to "auth_token" to match your storage
      const token = localStorage.getItem("auth_token");
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ["Job"],
  endpoints: (builder) => ({
    createJob: builder.mutation<unknown, JobFormState>({
      query: (data) => ({
        url: "/jobs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Job"],
    }),
    
    getJobs: builder.query<unknown, void>({
      query: () => "/jobs",
      providesTags: ["Job"],
    }),
  }),
});

export const { useCreateJobMutation, useGetJobsQuery } = jobApi;