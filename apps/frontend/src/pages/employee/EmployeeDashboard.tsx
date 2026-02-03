/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  FileText,
  MapPin,
  DollarSign,
  X,
  Send,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useGetJobsQuery } from "@/store/api/jobApi";


import {
  useGetMyReferralsQuery,
  useSubmitReferralMutation,
} from "@/store/api/refralApi";

export default function EmployeeDashboard() {
  // Reuse existing jobs query - filter for published jobs only
  const { data: allJobs = [], isLoading: jobsLoading, isError: jobsError } = useGetJobsQuery();

  // Filter for only published/active jobs for employee referral
  const openJobs = allJobs.filter((job) => job.status === "published");

  // Fetch user's referrals
  const {
    data: myReferrals = [],
    isLoading: referralsLoading,
    isError: referralsError,
  } = useGetMyReferralsQuery(undefined, {});
  const [submitReferral, { isLoading: isSubmitting }] = useSubmitReferralMutation();

  const [showReferralForm, setShowReferralForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [referralData, setReferralData] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    relationship: "",
    resumeFile: null as File | null,
    notes: "",
  });

  // Calculate stats from real data
  const stats = [
    {
      label: "Open Positions",
      value: openJobs.length,
      icon: Briefcase,
      color: "bg-gradient-to-br from-primary/20 to-primary/5",
      borderColor: "hover:border-primary/50",
      iconColor: "bg-primary/10 text-primary",
    },
    {
      label: "My Referrals",
      value: myReferrals.length,
      icon: Users,
      color: "bg-gradient-to-br from-blue-500/20 to-blue-500/5",
      borderColor: "hover:border-blue-500/50",
      iconColor: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Pending Review",
      value: myReferrals.filter((r: any) => r.status === "Under Review" || r.status === "Pending").length,
      icon: Clock,
      color: "bg-gradient-to-br from-amber-500/20 to-amber-500/5",
      borderColor: "hover:border-amber-500/50",
      iconColor: "bg-amber-500/10 text-amber-500",
    },
    {
      label: "Successful Hires",
      value: myReferrals.filter((r: any) => r.status === "Hired").length,
      icon: CheckCircle,
      color: "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5",
      borderColor: "hover:border-emerald-500/50",
      iconColor: "bg-emerald-500/10 text-emerald-500",
    },
  ];

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitReferral({
        candidateName: referralData.candidateName,
        candidateEmail: referralData.candidateEmail,
        candidatePhone: referralData.candidatePhone,
        relationship: referralData.relationship,
        notes: referralData.notes,
        jobId: selectedJob || "",
        resumeFile: referralData.resumeFile,
      }).unwrap();

      toast.success("Referral submitted");
      setShowReferralForm(false);
      setReferralData({
        candidateName: "",
        candidateEmail: "",
        candidatePhone: "",
        relationship: "",
        resumeFile: null,
        notes: "",
      });
    } catch (err) {
     
      console.error("Referral submit error:", err);
      toast.error("Failed to submit referral. Please try again.");
    }
  };

    useEffect(() => {
      if (jobsError || referralsError) {
        toast.error("Failed to load dashboard. Please try again.");
      }
    }, [jobsError, referralsError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReferralData({ ...referralData, resumeFile: e.target.files[0] });
    }
  };

  const openReferralForm = (jobId: string) => {
    setSelectedJob(jobId);
    setShowReferralForm(true);
  };

  // Format salary (reuse from ManageJobs)
  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
      return `₹${(num / 1000).toFixed(0)}K`;
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  };

  // Get status color for referrals
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "interview scheduled":
      case "interviewing":
        return "text-blue-600 bg-blue-500/10";
      case "under review":
      case "pending":
        return "text-amber-600 bg-amber-500/10";
      case "hired":
      case "accepted":
        return "text-emerald-600 bg-emerald-500/10";
      case "rejected":
        return "text-red-600 bg-red-500/10";
      default:
        return "text-gray-600 bg-gray-500/10";
    }
  };

  // Loading state
  if (jobsLoading || referralsLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (jobsError || referralsError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center p-6 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Failed to load dashboard
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
      className="space-y-6 pb-8 p-6"
    >
      {/* Header with animation */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Employee Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          View open positions and refer talented candidates you know
        </p>
      </motion.div>

      {/* Stats Grid with enhanced animations */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
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
                className={`
                  relative overflow-hidden
                  border rounded-2xl p-5
                  ${item.color}
                  border-border/50
                  ${item.borderColor}
                  transition-all duration-300
                  group
                  hover:shadow-xl hover:shadow-primary/10
                `}
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${item.iconColor}`}>
                      <Icon size={20} />
                    </div>
                    <TrendingUp
                      size={16}
                      className="text-muted-foreground group-hover:text-primary transition-colors duration-300"
                    />
                  </div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* My Referrals */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-card border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-lg">My Referrals</h2>
            <p className="text-sm text-muted-foreground">
              Track the status of your candidate referrals
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary">
            <UserPlus size={16} />
            <span>{myReferrals.length} total</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {myReferrals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="text-primary" size={24} />
              </div>
              <p className="text-muted-foreground font-medium">No referrals yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start referring candidates below to earn rewards!
              </p>
            </motion.div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Candidate Name</th>
                  <th className="pb-3 font-medium text-muted-foreground">Position</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Submitted</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {myReferrals.map((referral: any, index: number) => (
                    <motion.tr
                      key={referral._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      className="border-b last:border-0 transition-colors"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {referral.candidateName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{referral.candidateName}</span>
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {referral.jobTitle || referral.job?.title}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            referral.status
                          )}`}
                        >
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(referral.createdAt || referral.submittedDate).toLocaleDateString(
                            "en-IN",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Open Positions */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-card border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-lg">Open Positions</h2>
            <p className="text-sm text-muted-foreground">
              Refer candidates for these active job openings
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary">
            <Briefcase size={16} />
            <span>{openJobs.length} positions</span>
          </div>
        </div>

        {openJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="text-primary" size={24} />
            </div>
            <p className="text-muted-foreground font-medium">No open positions</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back soon for new opportunities!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {openJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.2 },
                  }}
                  className="relative border rounded-xl p-5 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300 group overflow-hidden"
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Briefcase size={14} />
                          {job.department}
                        </p>
                      </div>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-lg"
                      >
                        <Sparkles size={12} />
                        Bonus
                      </motion.span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin size={14} className="text-primary" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={14} className="text-blue-500" />
                        <span>{job.jobType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DollarSign size={14} className="text-emerald-500" />
                        <span className="font-medium">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openReferralForm(job._id)}
                      className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-sm font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      <Send size={16} />
                      Refer a Candidate
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Referral Form Modal */}
      <AnimatePresence>
        {showReferralForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !isSubmitting && setShowReferralForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Submit Referral
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Help us find great talent and earn rewards
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowReferralForm(false)}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                  disabled={isSubmitting}
                >
                  <X size={18} />
                </motion.button>
              </div>

              <form onSubmit={handleReferralSubmit} className="space-y-4">
                {/* Candidate Name */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    Candidate Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={referralData.candidateName}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        candidateName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter full name"
                    disabled={isSubmitting}
                  />
                </motion.div>

                {/* Candidate Email */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-blue-500" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={referralData.candidateEmail}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        candidateEmail: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="candidate@example.com"
                    disabled={isSubmitting}
                  />
                </motion.div>

                {/* Candidate Phone */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Phone size={16} className="text-emerald-500" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={referralData.candidatePhone}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        candidatePhone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="+91 XXXXX XXXXX"
                    disabled={isSubmitting}
                  />
                </motion.div>

                {/* Relationship */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    Relationship to Candidate *
                  </label>
                  <select
                    required
                    value={referralData.relationship}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        relationship: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    disabled={isSubmitting}
                  >
                    <option value="">Select relationship</option>
                    <option value="friend">Friend</option>
                    <option value="former_colleague">Former Colleague</option>
                    <option value="family">Family Member</option>
                    <option value="acquaintance">Acquaintance</option>
                    <option value="other">Other</option>
                  </select>
                </motion.div>

                {/* Resume Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-purple-500" />
                    Resume/CV *
                  </label>
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-2.5 border rounded-lg bg-background file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium hover:file:bg-primary/90 transition-all"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <span>📎</span>
                    PDF, DOC, or DOCX (Max 5MB)
                  </p>
                </motion.div>

                {/* Additional Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={referralData.notes}
                    onChange={(e) =>
                      setReferralData({
                        ...referralData,
                        notes: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    rows={4}
                    placeholder="Why do you think this candidate would be a good fit?"
                    disabled={isSubmitting}
                  />
                </motion.div>

                {/* Form Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-3 pt-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowReferralForm(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border hover:bg-accent transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Referral
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-4 right-4 text-xs text-muted-foreground"
      >
        <div className="flex items-center gap-2 bg-card border rounded-full px-3 py-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Live • Updated just now</span>
        </div>
      </motion.div>
    </motion.div>
  );
}