import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useGetJobsQuery } from "@/store/jobApi";
import type { Job } from "@/types/job";
import { useGetAllReferralsQuery } from "@/store/refralApi";

const pipelineStages = ["Applied", "Screening", "Interview", "Offer", "Hired"];

export default function HRDashboard() {
  const navigate = useNavigate();

  // API calls
  const {
    data: allJobs = [],
    isLoading,
    isError,
  } = useGetJobsQuery();
  
  const { data: referrals = [] } = useGetAllReferralsQuery();

  // Memoized calculations
  const referredJobsCount = useMemo(() => {
    const uniqueJobIds = new Set<string>();

    referrals.forEach((ref) => {
      if (ref.job) {
        // handles both populated & non-populated job
        const jobId =
          typeof ref.job === "string" ? ref.job : ref.job._id;

        if (jobId) {
          uniqueJobIds.add(jobId);
        }
      }
    });

    return uniqueJobIds.size;
  }, [referrals]);

  const referredJobIds = useMemo(() => {
    const set = new Set<string>();

    referrals.forEach((ref) => {
      if (ref.job) {
        const jobId =
          typeof ref.job === "string" ? ref.job : ref.job._id;

        if (jobId) {
          set.add(jobId);
        }
      }
    });

    return set;
  }, [referrals]);

  const activeJobs = useMemo(() => {
    return allJobs.filter(
      (job: Job) => job.status === "published" && !job.deleted
    );
  }, [allJobs]);

  const jobsWithoutReferrals = useMemo(() => {
    return allJobs.filter(
      (job: Job) =>
        job.status === "published" &&
        !job.deleted &&
        !referredJobIds.has(job._id)
    );
  }, [allJobs, referredJobIds]);

  const pendingReferralsCount = jobsWithoutReferrals.length;

  const pipelineCounts = useMemo(() => {
    return pipelineStages.reduce<Record<string, number>>((acc, stage) => {
      // eslint-disable-next-line react-hooks/purity
      acc[stage] = Math.floor(Math.random() * 30);
      return acc;
    }, {});
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-red-600 dark:text-red-400">
          Failed to load dashboard data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">HR Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of hiring activities and performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Active Jobs", value: activeJobs.length },
          { label: "New Applications", value: referredJobsCount },
          { label: "Interviews", value: 0 },
          { label: "Candidates", value: 142 },
          { label: "Hires (Month)", value: 0 },
          { label: "Pending Referrals", value: pendingReferralsCount },
        ].map((item) => {
          const isActiveJobs = item.label === "Active Jobs";
          
          const handleStatClick = (label: string) => {
            switch (label) {
              case "Active Jobs":
                navigate("/jobs/manage");
                break;

              case "New Applications":
                navigate("/candidates"); // ✅ Candidate Pipeline
                break;

              default:
                break;
            }
          };
          
          return (
            <div
              key={item.label}
              onClick={() => handleStatClick(item.label)}
              className={`
                bg-card border rounded-xl p-4
                ${isActiveJobs ? "cursor-pointer hover:shadow-md transition" : ""}
              `}
            >
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Pipeline */}
        <div className="bg-card border rounded-xl p-4 lg:col-span-2">
          <h2 className="font-semibold mb-4">Candidate Pipeline</h2>
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            {pipelineStages.map((stage) => (
              <div key={stage}>
                <p className="font-medium">{stage}</p>
                <p className="text-lg font-bold text-primary mt-1">
                  {pipelineCounts[stage]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-card border rounded-xl p-4">
          <h2 className="font-semibold mb-4">Upcoming Interviews</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <p className="font-medium">Ankit Sharma</p>
              <p className="text-muted-foreground">
                React Developer – Today 11:00 AM
              </p>
            </li>
            <li>
              <p className="font-medium">Neha Verma</p>
              <p className="text-muted-foreground">
                QA Engineer – Tomorrow 2:30 PM
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            "Post New Job",
            "View Candidates",
            "Manage Referrals",
            "View Reports",
          ].map((action) => (
            <button
              key={action}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}