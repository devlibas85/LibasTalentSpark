import { Navigate } from "react-router-dom";
import type { JSX } from "react/jsx-runtime";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const token = localStorage.getItem("auth_token");
  const role = localStorage.getItem("user_role");

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
