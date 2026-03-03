import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "@/store/api/authApi";
import { setAuth } from "@/store/slice/authSlice";

export default function ProtectedRoute() {
  const dispatch = useDispatch();

  const { data, isLoading, isError } = useGetMeQuery();

  // While verifying cookie
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // If cookie invalid
  if (isError || !data?.success) {
    return <Navigate to="/login" replace />;
  }

  // If valid, sync Redux once
  if (data?.success) {
    dispatch(
      setAuth({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      })
    );
  }

  return <Outlet />;
}