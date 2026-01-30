import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getHealth } from "./api/health";

import Login from "./pages/Login ";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthSuccess from "./pages/AuthSuccess";
import DashboardLayout from "./components/layouts/DashboardLayout";

// Common Pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// HR Pages
import PostJob from "./pages/hr/PostJob";
import ManageJobs from "./pages/hr/ManageJobs";
import CandidatePipeline from "./pages/hr/CandidatePipeline";
import ReferralsManagement from "./pages/hr/RefralManagement";
import ReportsAnalytics from "./pages/hr/ReportAnalysis";

// EMPLOYEE Pages

import BrowseJobs from "./pages/employee/BrowseJobs";
import MyApplications from "./pages/employee/MyApplications";
import ReferCandidate from "./pages/employee/ReferCandidates";
import MyReferrals from "./pages/employee/MyRefrals";


function App() {
  useEffect(() => {
    getHealth().then(console.log);
  }, []);

  // Helper to get user role from localStorage
  const getUserRole = (): "hr" | "employee" => {
    const role = localStorage.getItem("user_role");
    return role === "HR" ? "hr" : "employee";
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/success" element={<AuthSuccess />} />

      {/* Protected routes with layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout role={getUserRole()}>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs/post"
        element={
          <ProtectedRoute>
            <DashboardLayout role="hr">
              <PostJob />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs/manage"
        element={
          <ProtectedRoute>
            <DashboardLayout role="hr">
              <ManageJobs />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            <DashboardLayout role="hr">
              <CandidatePipeline />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/referrals-manage"
        element={
          <ProtectedRoute>
            <DashboardLayout role="hr">
              <ReferralsManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout role="hr">
              <ReportsAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout role={getUserRole()}>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout role={getUserRole()}>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
  path="/browse-jobs"
  element={
    <ProtectedRoute>
      <DashboardLayout role="employee">
        <BrowseJobs />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/applications"
  element={
    <ProtectedRoute>
      <DashboardLayout role="employee">
        <MyApplications />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/refer"
  element={
    <ProtectedRoute>
      <DashboardLayout role="employee">
        <ReferCandidate />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/my-referrals"
  element={
    <ProtectedRoute>
      <DashboardLayout role="employee">
        <MyReferrals />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;