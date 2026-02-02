import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetMyReferralsQuery } from "@/store/api/refralApi";
import type { Referral, ReferralStatus } from "@/store/api/refralApi";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  DollarSign,
  Gift,
  TrendingUp,
  History,
  Award,
  Share2,
  MessageSquare,
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
  { label: string; color: string; bg: string; borderColor: string; icon: LucideIcon; }
> = {
  submitted: {
    label: "Submitted",
    color: "text-blue-600",
    bg: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: AlertCircle,
  },
  interview_scheduled: {
    label: "Interview Scheduled",
    color: "text-purple-600",
    bg: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: Calendar,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-50",
    borderColor: "border-red-200",
    icon: XCircle,
  },
  hired: {
    label: "Hired",
    color: "text-green-600",
    bg: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle2,
  },
};

export const MyReferralDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const [withdrawalMethod, setWithdrawalMethod] = useState("bank");

  const { data: referrals = [], isLoading, isError } = useGetMyReferralsQuery();

  const referral = referrals.find((r: Referral) => r._id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading referral details...</p>
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
            Failed to Load Data
          </h2>
          <p className="text-red-700 mb-4">
            We couldn't retrieve the referral information. Please try again.
          </p>
          <button
            onClick={() => navigate("/my-referrals")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to My Referrals
          </button>
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            Referral Not Found
          </h2>
          <p className="text-yellow-700 mb-4">
            The referral you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/my-referrals")}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Back to My Referrals
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig[referral.status];
  const StatusIcon = status.icon;
  const reward = statusRewards[referral.status];
  const canWithdraw = referral.status === "hired" && reward > 0;

  // Get initials
  const initials = referral.candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/my-referrals")}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Referral Details
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Track your referral progress and earnings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-2xl p-6"
            >
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                  <span className="text-3xl font-bold text-primary">
                    {initials}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-1">
                        {referral.candidateName}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        {referral.job?.title || "Position Not Specified"}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border ${status.bg} ${status.borderColor}`}
                    >
                      <StatusIcon size={18} className={status.color} />
                      <span className={`font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Mail size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">
                          {referral.candidateEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <Phone size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">
                          {referral.candidatePhone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <MapPin size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Location
                        </p>
                        <p className="text-sm font-medium">
                          {referral.job?.location || "Not Specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                        <Calendar size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Applied On
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(referral.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Position Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-primary" />
                Position Details
              </h3>
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job Title</span>
                  <span className="font-medium">
                    {referral.job?.title || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">
                    {referral.job?.location || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Relationship</span>
                  <span className="font-medium capitalize">
                    {referral.relationship || "—"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Notes */}
            {referral.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare size={20} className="text-primary" />
                  Your Notes
                </h3>
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {referral.notes}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Resume */}
            {referral.resume && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  Resume
                </h3>
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <FileText size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Candidate Resume.pdf</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on{" "}
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Rewards & Timeline */}
          <div className="space-y-6">
            {/* Reward Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl p-6 ${
                canWithdraw
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                  : "bg-card border"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    canWithdraw ? "bg-white/20" : "bg-primary/10"
                  }`}
                >
                  {canWithdraw ? (
                    <Gift size={24} className="text-white" />
                  ) : (
                    <DollarSign size={24} className="text-primary" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      canWithdraw ? "text-white/80" : "text-muted-foreground"
                    }`}
                  >
                    {canWithdraw ? "Earned Reward" : "Potential Reward"}
                  </p>
                  <p className="text-3xl font-bold">₹{reward}</p>
                </div>
              </div>

              {canWithdraw ? (
                <>
                  <div className="bg-white/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <CheckCircle2 size={16} />
                      <span className="font-medium">
                        Congratulations! Candidate hired successfully
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="w-full px-4 py-3 bg-white text-green-600 rounded-xl hover:bg-white/90 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Award size={18} />
                    Withdraw Reward
                  </button>
                </>
              ) : (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    Reward will be available once the candidate is hired
                  </p>
                </div>
              )}
            </motion.div>

            {/* Progress Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                Reward Progress
              </h3>
              <div className="space-y-4">
                {[
                  {
                    status: "submitted",
                    label: "Submitted",
                    reward: 0,
                    icon: Clock,
                  },
                  {
                    status: "under_review",
                    label: "Under Review",
                    reward: 100,
                    icon: AlertCircle,
                  },
                  {
                    status: "interview_scheduled",
                    label: "Interview",
                    reward: 250,
                    icon: Calendar,
                  },
                  {
                    status: "hired",
                    label: "Hired",
                    reward: 1000,
                    icon: CheckCircle2,
                  },
                ].map((stage, index) => {
                  const isCompleted =
                    Object.keys(statusRewards).indexOf(referral.status) >=
                    Object.keys(statusRewards).indexOf(
                      stage.status as ReferralStatus
                    );
                  const isCurrent = referral.status === stage.status;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.status} className="relative">
                      {index !== 3 && (
                        <div
                          className={`absolute left-5 top-12 bottom-0 w-0.5 ${
                            isCompleted ? "bg-primary" : "bg-border"
                          }`}
                        ></div>
                      )}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              isCurrent ? "text-primary" : ""
                            }`}
                          >
                            {stage.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ₹{stage.reward} reward
                          </p>
                        </div>
                        {isCompleted && (
                          <CheckCircle2
                            size={16}
                            className="text-primary flex-shrink-0"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Timeline */}
            {referral.actionHistory && referral.actionHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border rounded-2xl p-6"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <History size={18} className="text-primary" />
                  Activity Timeline
                </h3>
                <div className="space-y-3">
                  {referral.actionHistory.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">
                          {action.action.replace("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(action.actionAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Gift size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Withdraw Reward</h3>
                <p className="text-sm text-muted-foreground">
                  Request your referral bonus
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={reward}
                    disabled
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border bg-muted/50 font-semibold"
                  />
                </div>
              </div>

              {/* Method */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Withdrawal Method
                </label>
                <select
                  value={withdrawalMethod}
                  onChange={(e) => setWithdrawalMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="wallet">Digital Wallet</option>
                </select>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  The amount will be transferred to your registered{" "}
                  {withdrawalMethod === "bank"
                    ? "bank account"
                    : withdrawalMethod === "upi"
                    ? "UPI ID"
                    : "digital wallet"}{" "}
                  within 3-5 business days.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle withdrawal logic
                  alert("Withdrawal request submitted!");
                  setShowWithdrawModal(false);
                }}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Confirm Withdrawal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};