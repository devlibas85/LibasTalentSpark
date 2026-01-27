import HRDashboard from "./hr/HRDashboard";
import EmployeeDashboard from "./employee/EmployeeDashboard";

export default function Dashboard() {
  const role = localStorage.getItem("user_role");

  if (role === "HR") {
    return <HRDashboard />;
  }

  return <EmployeeDashboard />;
}
