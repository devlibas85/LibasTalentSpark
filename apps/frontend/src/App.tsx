import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import { getHealth } from "./api/health";

// Pages
import Login from "./pages/Login ";
import AuthSuccess from "./pages/AuthSuccess";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// Layout
import DashboardLayout from "./components/layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// HR Pages
import PostJob from "./pages/hr/jobs/PostJob";
import ManageJobs from "./pages/hr/jobs/ManageJobs";
import CandidatePipeline from "./pages/hr/candidatePipeline/CandidatePipeline";
import ReferralsManagement from "./pages/hr/RefralManagement";
import ReportsAnalytics from "./pages/hr/ReportAnalysis";

// Employee Pages
import BrowseJobs from "./pages/employee/BrowseJobs";
import MyReferrals from "./pages/employee/MyRefrals";
import { CandidateDetails } from "./pages/hr/candidatePipeline/CandidateDetails";
import { MyReferralDetails } from "./pages/employee/MyRefralsDetails";
import ViewJobDetails from "./pages/hr/jobs/jobDetails";
import EditJob from "./pages/hr/jobs/editJob";

function App() {
  const role = useSelector((state: RootState) => state.auth.role);

  useEffect(() => {
    getHealth().then((res) => console.debug("health:", res));
  }, []);

  // ✅ ProtectedRoute handles the loading spinner while /me is in-flight.
  // By the time any child route renders, role will be set.
  // We still guard here as a safety net so DashboardLayout never gets null.
  const safeRole = role ?? "employee";

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/success" element={<AuthSuccess />} />

      {/* Protected routes — ProtectedRoute calls /auth/me and rehydrates Redux */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <DashboardLayout role={safeRole}>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <DashboardLayout role={safeRole}>
              <Profile />
            </DashboardLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <DashboardLayout role={safeRole}>
              <Settings />
            </DashboardLayout>
          }
        />

        {/* HR routes */}
        <Route
          path="/jobs/post"
          element={
            <DashboardLayout role="hr">
              <PostJob />
            </DashboardLayout>
          }
        />

        <Route
          path="/jobs/manage"
          element={
            <DashboardLayout role="hr">
              <ManageJobs />
            </DashboardLayout>
          }
        />

        <Route
          path="/jobs/:jobId"
          element={
            <DashboardLayout role="hr">
              <ViewJobDetails />
            </DashboardLayout>
          }
        />

        <Route
          path="/jobs/edit/:jobId"
          element={
            <DashboardLayout role="hr">
              <EditJob />
            </DashboardLayout>
          }
        />

        <Route
          path="/candidates"
          element={
            <DashboardLayout role="hr">
              <CandidatePipeline />
            </DashboardLayout>
          }
        />

        <Route
          path="/candidates/:id"
          element={
            <DashboardLayout role="hr">
              <CandidateDetails />
            </DashboardLayout>
          }
        />

        <Route
          path="/referrals-manage"
          element={
            <DashboardLayout role="hr">
              <ReferralsManagement />
            </DashboardLayout>
          }
        />

        <Route
          path="/reports"
          element={
            <DashboardLayout role="hr">
              <ReportsAnalytics />
            </DashboardLayout>
          }
        />

        {/* Employee routes */}
        <Route
          path="/browse-jobs"
          element={
            <DashboardLayout role={safeRole}>
              <BrowseJobs />
            </DashboardLayout>
          }
        />

        <Route
          path="/my-referrals"
          element={
            <DashboardLayout role={safeRole}>
              <MyReferrals />
            </DashboardLayout>
          }
        />

        <Route
          path="/my-referrals/:id"
          element={
            <DashboardLayout role={safeRole}>
              <MyReferralDetails />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
