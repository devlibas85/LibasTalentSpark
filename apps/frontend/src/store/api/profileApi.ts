import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ProfileData {
  id?: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  position: string;
  joinDate: string;
  website: string;
  bio: string;
  avatarUrl?: string;

  isProfileComplete?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;

  createdAt?: string;
  updatedAt?: string;
}

export const profileApi = createApi({
  reducerPath: "profileApi",
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
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileData, void>({
      query: () => "/profile",
      transformResponse: (response: { success: boolean; data: ProfileData }) =>
        response.data,
      providesTags: ["Profile"],
    }),

    updateProfile: builder.mutation<ProfileData, Partial<ProfileData>>({
      query: (profileData) => ({
        url: "/profile",
        method: "PUT",
        body: profileData,
      }),
      transformResponse: (response: { success: boolean; data: ProfileData }) =>
        response.data,
      invalidatesTags: ["Profile"],
    }),

    uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
      query: (formData) => ({
        url: "/profile/avatar",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: {
        success: boolean;
        data: { avatarUrl: string };
      }) => response.data,
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} = profileApi;
