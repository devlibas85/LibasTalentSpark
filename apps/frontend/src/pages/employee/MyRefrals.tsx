import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGetMyReferralsQuery } from "@/store/api/refralApi";
import type {  ReferralStatus } from "@/store/api/refralApi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import {
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  XCircle,
  Gift,
  ArrowRight,
  Search,
  Filter,
  Plus,
  Zap,
} from "lucide-react";

// Status configuration with rewards
const statusRewards: Record<ReferralStatus, number> = {
  submitted: 0,
  under_review: 100,
  interview_scheduled: 250,
  rejected: 0,
  hired: 1000,
};

const statusConfig: Record<
  ReferralStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: LucideIcon;
  }
> = {

  submitted: {
    label: "Submitted",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    icon: AlertCircle,
  },
  interview_scheduled: {
    label: "Interview Scheduled",
    color: "text-purple-600",
    bg: "bg-purple-50",
    icon: Calendar,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-50",
    icon: XCircle,
  },
  hired: {
    label: "Hired",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: CheckCircle,
  },
};

const MyReferrals = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: referrals = [], isLoading, isError } = useGetMyReferralsQuery();

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load your referrals. Please try again.");
    }
  }, [isError]);

  // Calculate statistics
  const totalReferrals = referrals.length;
  const pendingReferrals = referrals.filter(
    (r) => r.status === "submitted" || r.status === "under_review"
  ).length;
  const hiredReferrals = referrals.filter((r) => r.status === "hired").length;
  
  const totalEarnings = referrals.reduce((sum, r) => {
    return sum + statusRewards[r.status];
  }, 0);

  const availableForWithdrawal = referrals
    .filter((r) => r.status === "hired")
    .reduce((sum, r) => sum + statusRewards[r.status], 0);

  // Filter referrals
  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      referral.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.job?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || referral.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your referrals...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Failed to Load Referrals
          </h2>
          <p className="text-red-700">
            We couldn't retrieve your referrals. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                My Referrals
              </h1>
              <p className="text-muted-foreground">
                Track your referrals and earn rewards for successful hires
              </p>
            </div>
            <button
              onClick={() => navigate("/browse-jobs")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              New Referral
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Referrals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  All Time
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {totalReferrals}
              </p>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
            </motion.div>

            {/* Pending */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
                <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                  In Progress
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {pendingReferrals}
              </p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </motion.div>

            {/* Hired */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  Success
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">
                {hiredReferrals}
              </p>
              <p className="text-sm text-muted-foreground">Successfully Hired</p>
            </motion.div>

            {/* Earnings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground hover:shadow-xl transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <DollarSign className="text-white" size={24} />
                  </div>
                  <Zap className="text-white/60" size={20} />
                </div>
                <p className="text-3xl font-bold mb-1">₹{totalEarnings}</p>
                <p className="text-sm text-white/80">Total Earnings</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Withdrawal Banner */}
        {availableForWithdrawal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                  <Gift className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900 mb-1">
                    Rewards Available!
                  </h3>
                  <p className="text-green-700">
                    You have{" "}
                    <span className="font-bold">₹{availableForWithdrawal}</span>{" "}
                    ready to withdraw
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/withdraw")}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
              >
                Withdraw Now
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="bg-card border rounded-2xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by candidate or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative md:w-56">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              >
                <option value="all">All Status</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        {filteredReferrals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={48} className="text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Referrals Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start referring candidates and earn rewards!
            </p>
            <button
              onClick={() => navigate("/submit-referral")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-semibold inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Submit Your First Referral
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReferrals.map((referral, index) => {
              const status = statusConfig[referral.status];
              const StatusIcon = status.icon;
              const reward = statusRewards[referral.status];

              return (
                <motion.div
                  key={referral._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/my-referrals/${referral._id}`)}
                  className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border-2 border-primary/10">
                        <span className="text-lg font-bold text-primary">
                          {referral.candidateName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                              {referral.candidateName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {referral.job?.title || "Position Not Specified"}
                            </p>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Status
                            </p>
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}
                            >
                              <StatusIcon size={14} />
                              {status.label}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Applied On
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(
                                referral.createdAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Location
                            </p>
                            <p className="text-sm font-medium">
                              {referral.job?.location || "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Reward
                            </p>
                            <p
                              className={`text-sm font-bold ${
                                reward > 0 ? "text-green-600" : "text-muted-foreground"
                              }`}
                            >
                              {reward > 0 ? `₹${reward}` : "Pending"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="ml-4 pt-2">
                      <ArrowRight
                        size={20}
                        className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReferrals;