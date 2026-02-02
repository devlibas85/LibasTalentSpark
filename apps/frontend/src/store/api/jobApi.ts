
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
   createJob: builder.mutation<unknown, FormData>({
  query: (data) => ({
    url: "/jobs",
    method: "POST",
    body: data,
  }),
  invalidatesTags: ["Job"],
}),

    
  getJobs: builder.query<Job[], void>({
  query: () => "/jobs",
  providesTags: ["Job"],
}),
  }),
});

export const { useCreateJobMutation, useGetJobsQuery } = jobApi;