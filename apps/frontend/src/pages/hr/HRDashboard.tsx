/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  UserPlus,
  Clock,
  ArrowRight,
  FileText,
  BarChart3,
} from "lucide-react";

import { useGetJobsQuery } from "@/store/api/jobApi";
import type { Job } from "@/types/job";
import { useGetAllReferralsQuery } from "@/store/api/refralApi";

const pipelineStages = ["Applied", "Screening", "Interview", "Hired"];

export default function HRDashboard() {
  const navigate = useNavigate();

  // API calls
  const { data: allJobs = [], isLoading, isError } = useGetJobsQuery();

  const { data: referrals = [] } = useGetAllReferralsQuery();

  // Memoized calculations (unchanged)
  const referredJobsCount = useMemo(() => {
    const uniqueJobIds = new Set<string>();

    referrals.forEach((ref) => {
      if (ref.job) {
        const jobId = typeof ref.job === "string" ? ref.job : ref.job._id;

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
        const jobId = typeof ref.job === "string" ? ref.job : ref.job._id;

        if (jobId) {
          set.add(jobId);
        }
      }
    });

    return set;
  }, [referrals]);

  const activeJobs = useMemo(() => {
    return allJobs.filter(
      (job: Job) => job.status === "published" && !job.deleted,
    );
  }, [allJobs]);

  const jobsWithoutReferrals = useMemo(() => {
    return allJobs.filter(
      (job: Job) =>
        job.status === "published" &&
        !job.deleted &&
        !referredJobIds.has(job._id),
    );
  }, [allJobs, referredJobIds]);

  const pendingReferralsCount = jobsWithoutReferrals.length;

  // REAL Candidate Pipeline Data from referrals
  const pipelineCounts = useMemo(() => {
    // Initialize counts for each stage
    const counts = pipelineStages.reduce<Record<string, number>>(
      (acc, stage) => {
        acc[stage] = 0;
        return acc;
      },
      {},
    );

    // Map backend referral statuses to pipeline stages
    const statusToStage: Record<string, string> = {
      submitted: "Applied",
      under_review: "Screening",
      interview_scheduled: "Interview",

      hired: "Hired",
    };

    // Count referrals by mapped stage
    referrals.forEach((ref) => {
      const raw = (ref.status || "").toString();
      const stage =
        statusToStage[raw] || (pipelineStages.includes(raw) ? raw : "Applied");
      counts[stage] = (counts[stage] || 0) + 1;
    });

    return counts;
  }, [referrals]);

  // Calculate total candidates for percentage
  const totalCandidates = useMemo(() => {
    return Object.values(pipelineCounts).reduce((sum, count) => sum + count, 0);
  }, [pipelineCounts]);

  // Upcoming interviews derived from referrals with status 'interview_scheduled'
  const upcomingInterviews = useMemo(() => {
    return referrals
      .filter((r) => r.status === "interview_scheduled")
      .map((r) => {
        // try to find a timestamp from actionHistory
        const history = (r.actionHistory || []).slice().reverse();
        const interviewAction = history.find((h: any) =>
          (h.action || "").toLowerCase().includes("interview"),
        );
        const timeRaw = interviewAction?.actionAt || r.createdAt || "";
        const time = timeRaw
          ? new Date(timeRaw).toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : "Scheduled";
        return {
          id: r._id,
          name: r.candidateName,
          role: (r.job && (r.job as any).title) || "Candidate",
          time,
        };
      });
  }, [referrals]);

  // Stats with icons and colors
  const stats = [
    {
      label: "Active Jobs",
      value: activeJobs.length,
      icon: Briefcase,
      color: "bg-gradient-to-br from-primary/20 to-primary/5",
      borderColor: "hover:border-primary/50",
      navigateTo: "/jobs/manage",
    },
    {
      label: "New Applications",
      value: referredJobsCount,
      icon: UserPlus,
      color: "bg-gradient-to-br from-blue-500/20 to-blue-500/5",
      borderColor: "hover:border-blue-500/50",
      navigateTo: "/candidates",
    },
    {
      label: "Interviews",
      value: pipelineCounts["Interview"] || 0,
      icon: Calendar,
      color: "bg-gradient-to-br from-green-500/20 to-green-500/5",
      borderColor: "hover:border-green-500/50",
      navigateTo: "/interviews",
    },
    {
      label: "Candidates",
      value: totalCandidates,
      icon: Users,
      color: "bg-gradient-to-br from-purple-500/20 to-purple-500/5",
      borderColor: "hover:border-purple-500/50",
      navigateTo: "/candidates",
    },
    {
      label: "Hires (Month)",
      value: pipelineCounts["Hired"] || 0,
      icon: TrendingUp,
      color: "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5",
      borderColor: "hover:border-emerald-500/50",
      navigateTo: "/reports",
    },
    {
      label: "Pending Referrals",
      value: pendingReferralsCount,
      icon: Clock,
      color: "bg-gradient-to-br from-amber-500/20 to-amber-500/5",
      borderColor: "hover:border-amber-500/50",
      navigateTo: "/referrals-manage",
    },
  ];

  const quickActions = [
    {
      label: "Post New Job",
      icon: FileText,
      color: "bg-primary hover:bg-primary/90",
      route: "/jobs/post",
    },
    {
      label: "View Candidates",
      icon: Users,
      color: "bg-blue-600 hover:bg-blue-700",
      route: "/candidates",
    },
    {
      label: "Manage Referrals",
      icon: UserPlus,
      color: "bg-emerald-600 hover:bg-emerald-700",
      route: "/referrals-manage",
    },
    {
      label: "View Reports",
      icon: BarChart3,
      color: "bg-purple-600 hover:bg-purple-700",
      route: "/reports",
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-75"
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-75"
      >
        <div className="text-center p-6 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Failed to load dashboard data
          </p>
          <p className="text-sm text-red-500 dark:text-red-300 mt-1">
            Please try refreshing the page
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with animation */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          HR Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Overview of hiring activities and performance
        </p>
      </motion.div>

      {/* Stats Grid with enhanced animations */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        <AnimatePresence>
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{
                  scale: 1.02,
                  y: -4,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => item.navigateTo && navigate(item.navigateTo)}
                className={`
                  relative overflow-hidden
                  border rounded-2xl p-5
                  ${item.color}
                  border-border/50
                  ${item.borderColor}
                  transition-all duration-300
                  cursor-pointer
                  group
                  hover:shadow-xl hover:shadow-primary/10
                  ${item.label === "Active Jobs" ? "ring-1 ring-primary/20" : ""}
                `}
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-linear-to-br from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2 rounded-lg ${item.label === "Active Jobs" ? "bg-primary/10 text-primary" : "bg-black/5 dark:bg-white/10 text-muted-foreground"}`}
                    >
                      <Icon size={20} />
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300"
                    />
                  </div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.label}
                  </p>

                  {/* Progress indicator for Active Jobs */}
                  {item.label === "Active Jobs" && activeJobs.length > 0 && (
                    <div className="mt-3">
                      <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min((activeJobs.length / 10) * 100, 100)}%`,
                          }}
                          transition={{ delay: 0.5, duration: 1 }}
                          className="h-full bg-linear-to-r from-primary to-primary/70"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Middle section with enhanced animations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Pipeline with REAL data */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card border rounded-2xl p-5 lg:col-span-2 group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-lg">Candidate Pipeline</h2>
              <p className="text-sm text-muted-foreground">
                {totalCandidates} total candidates across{" "}
                {pipelineStages.length} stages
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary">
              <TrendingUp size={16} />
              <span>Real-time data</span>
            </div>
          </div>

          {/* Pipeline visualization */}
          <div className="grid grid-cols-5 gap-3">
            {pipelineStages.map((stage, index) => {
              const count = pipelineCounts[stage] || 0;
              const percentage =
                totalCandidates > 0
                  ? Math.round((count / totalCandidates) * 100)
                  : 0;

              return (
                <motion.div
                  key={stage}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                  onClick={() =>
                    navigate(`/candidates?stage=${stage.toLowerCase()}`)
                  }
                  className="text-center group/pipeline cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover/pipeline:from-primary/20 group-hover/pipeline:to-primary/10 transition-all duration-300">
                      <div className="text-center">
                        <span className="text-lg font-bold text-primary block">
                          {count}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary opacity-0 group-hover/pipeline:opacity-100"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  </div>

                  <p className="font-medium text-sm mb-1">{stage}</p>

                  {/* Stage progress bar */}
                  <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 1 }}
                      className={`h-full ${
                        stage === "Applied"
                          ? "bg-blue-500"
                          : stage === "Screening"
                            ? "bg-amber-500"
                            : stage === "Interview"
                              ? "bg-green-500"
                              : stage === "Offer"
                                ? "bg-purple-500"
                                : "bg-emerald-500"
                      }`}
                    />
                  </div>

                  {/* Stage indicator */}
                  <div className="flex items-center justify-center mt-2">
                    <div
                      className={`w-2 h-2 rounded-full mr-1 ${
                        stage === "Applied"
                          ? "bg-blue-500"
                          : stage === "Screening"
                            ? "bg-amber-500"
                            : stage === "Interview"
                              ? "bg-green-500"
                              : stage === "Offer"
                                ? "bg-purple-500"
                                : "bg-emerald-500"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {stage === "Hired"
                        ? "Final stage"
                        : `${pipelineStages[index + 1] || "Next"} →`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pipeline summary */}
          {totalCandidates > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 pt-4 border-t"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Applied: {pipelineCounts["Applied"]}</span>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Screening: {pipelineCounts["Screening"]}</span>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Interview: {pipelineCounts["Interview"]}</span>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Offer: {pipelineCounts["Offer"]}</span>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span>Hired: {pipelineCounts["Hired"]}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Upcoming Interviews */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card border rounded-2xl p-5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Upcoming Interviews</h2>
            <Calendar className="text-blue-500" size={20} />
          </div>
          <ul className="space-y-4">
            {upcomingInterviews.length === 0 ? (
              <li className="p-3 rounded-xl text-sm text-muted-foreground">
                No upcoming interviews
              </li>
            ) : (
              upcomingInterviews.map((interview, index) => (
                <motion.li
                  key={interview.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.06 }}
                  whileHover={{ x: 4 }}
                  className="p-3 rounded-xl hover:bg-accent/50 transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg bg-primary/10 text-primary`}
                    >
                      <Users size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{interview.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {interview.role}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={12} className="text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {interview.time}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-muted-foreground mt-1"
                    />
                  </div>
                </motion.li>
              ))
            )}
          </ul>
        </motion.div>
      </div>

      {/* Quick Actions with enhanced buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-card border rounded-2xl p-5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
      >
        <h2 className="font-semibold text-lg mb-5">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.route)}
                className={`
                  px-5 py-3 rounded-xl
                  ${action.color}
                  text-white
                  flex items-center gap-3
                  transition-all duration-300
                  hover:shadow-lg
                  active:scale-95
                `}
              >
                <Icon size={18} />
                <span className="font-medium">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Floating indicator for primary color usage */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-4 right-4 text-xs text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span>Live dashboard • Updated just now</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
