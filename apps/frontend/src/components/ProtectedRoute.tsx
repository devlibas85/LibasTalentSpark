import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useGetMeQuery } from "@/store/api/authApi";
import { setAuth } from "@/store/slice/authSlice";

export default function ProtectedRoute() {
  const dispatch = useDispatch();

  const { data, isLoading, isFetching, isError } = useGetMeQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // sync redux after auth verification
  useEffect(() => {
    if (data?.success) {
      dispatch(
        setAuth({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        }),
      );
    }
  }, [data, dispatch]);

  // show loader while checking cookie
  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // redirect if not authenticated
  if (isError || !data?.success) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
