import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function ProtectedRoute() {
  const { token } = useSelector((state: RootState) => state.auth);
  const rehydrated = useSelector(
    (state: RootState) => state._persist?.rehydrated
  );

 
  if (!rehydrated) {
    return null; // or loader/spinner
  }

 
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
