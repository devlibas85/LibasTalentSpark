import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import HRDashboard from "./hr/HRDashboard";
import EmployeeDashboard from "./employee/EmployeeDashboard";

export default function Dashboard() {
  const role = useSelector((state: RootState) => state.auth.role);

  if (!role) return null;

  return role === "hr" ? <HRDashboard /> : <EmployeeDashboard />;
}
