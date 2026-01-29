import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { JobFormState } from "./jobFormSlice";

export const jobApi = createApi({
  reducerPath: "jobApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  endpoints: (builder) => ({
    parseJD: builder.mutation<Partial<JobFormState>, FormData>({
      query: (formData) => ({
        url: "/jobs/parse-jd",
        method: "POST",
        body: formData,
      }),
    }),

    createJob: builder.mutation<{ success: boolean }, JobFormState>({
      query: (data) => ({
        url: "/jobs",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useParseJDMutation,
  useCreateJobMutation,
} = jobApi;
