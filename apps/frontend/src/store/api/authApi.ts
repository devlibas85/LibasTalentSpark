import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "HR" | "EMPLOYEE";
}

interface SuccessResponse {
  success: boolean;
  message?: string;
}

interface LoginResponse {
  success: boolean;
  user: AuthUser;
}

interface RegisterResponse {
  success: boolean;
  user: AuthUser;
}

// ✅ Used to rehydrate Redux on page load via the httpOnly cookie
interface MeResponse {
  success: boolean;
  user: AuthUser;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include", // sends httpOnly cookie on every request
  }),
  endpoints: (builder) => ({
    // ✅ NEW: call on app load to restore auth state from cookie
    getMe: builder.query<MeResponse, void>({
      query: () => "/auth/me",
    }),

    // SEND OTP
    sendOtp: builder.mutation<SuccessResponse, { email: string }>({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
    }),

    // VERIFY OTP
    verifyOtp: builder.mutation<
      SuccessResponse,
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),

    // REGISTER — fixed: 2 type params, correct arg type
    register: builder.mutation<
      RegisterResponse,
      { email: string; password: string; name?: string }
    >({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    // LOGIN
    login: builder.mutation<LoginResponse, { email: string; password: string }>(
      {
        query: (body) => ({
          url: "/auth/login",
          method: "POST",
          body,
        }),
      },
    ),
  }),
});

export const {
  useGetMeQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
  useLoginMutation,
} = authApi;
