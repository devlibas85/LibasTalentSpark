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
import PostJob from "./pages/hr/PostJob";
import ManageJobs from "./pages/hr/ManageJobs";
import CandidatePipeline from "./pages/hr/candidatePipeline/CandidatePipeline";
import ReferralsManagement from "./pages/hr/RefralManagement";
import ReportsAnalytics from "./pages/hr/ReportAnalysis";

// Employee Pages
import BrowseJobs from "./pages/employee/BrowseJobs";

import ReferCandidate from "./pages/employee/ReferCandidates";
import MyReferrals from "./pages/employee/MyRefrals";
import { CandidateDetails } from "./pages/hr/candidatePipeline/CandidateDetails";
import { MyReferralDetails } from "./pages/employee/MyRefralsDetails";

function App() {
  const role = useSelector((state: RootState) => state.auth.role);
  console.log("🧠 ROLE FROM REDUX IN APP:", role);

  useEffect(() => {
    getHealth().then(console.log);
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/success" element={<AuthSuccess />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <DashboardLayout role={role!}>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <DashboardLayout role={role!}>
              <Profile />
            </DashboardLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <DashboardLayout role={role!}>
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
            <DashboardLayout role="employee">
              <BrowseJobs />
            </DashboardLayout>
          }
        />

      

        <Route
          path="/refer"
          element={
            <DashboardLayout role="employee">
              <ReferCandidate />
            </DashboardLayout>
          }
        />

        <Route
          path="/my-referrals"
          element={
            <DashboardLayout role="employee">
              <MyReferrals />
            </DashboardLayout>
          }
        />
      </Route>
       <Route
          path="/my-referrals/:id"
          element={
            <DashboardLayout role="employee">
              <MyReferralDetails />
            </DashboardLayout>
          }
        />
     

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
