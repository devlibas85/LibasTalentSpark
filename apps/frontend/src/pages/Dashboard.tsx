// src/pages/Dashboard.tsx
import HRDashboard from "./hr/HRDashboard";
import EmployeeDashboard from "./employee/EmployeeDashboard";

export default function Dashboard() {
  const roleFromStorage = localStorage.getItem("user_role");
  const role = roleFromStorage === "HR" ? "hr" : "employee";

  // Just return the appropriate dashboard without layout
  return role === "hr" ? <HRDashboard /> : <EmployeeDashboard />;
}