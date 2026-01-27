import DashboardLayout from "../layouts/DashboardLayout";
import HRDashboard from "./hr/HRDashboard";
import EmployeeDashboard from "./employee/EmployeeDashboard";

export default function Dashboard() {
  const roleFromStorage = localStorage.getItem("user_role");

  const role = roleFromStorage === "HR" ? "hr" : "employee";

  return (
    <DashboardLayout role={role}>
      {role === "hr" ? <HRDashboard /> : <EmployeeDashboard />}
    </DashboardLayout>
  );
}
