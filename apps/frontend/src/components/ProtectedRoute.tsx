import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetMeQuery } from "@/store/api/authApi";
import { setAuth, logout } from "@/store/slice/authSlice";

export default function ProtectedRoute() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // ─── Call /auth/me on every mount ───────────────────────────────────────────
  // The httpOnly cookie is sent automatically. If valid, we get back the user
  // and rehydrate Redux. If invalid/expired, we clear state and redirect.
  // This is the correct pattern for cookie-based auth — no localStorage needed.
  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    // Don't re-fetch if we already know we're authenticated in this session
    skip: false,
  });

  useEffect(() => {
    if (data?.success && data.user) {
      dispatch(setAuth({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      }));
    }
    if (isError) {
      dispatch(logout());
    }
  }, [data, isError, dispatch]);

  // ─── While /me is in-flight, show a spinner ──────────────────────────────
  // This prevents a flash-redirect to /login on every refresh
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // ─── /me failed = cookie gone/expired = not authenticated ────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}