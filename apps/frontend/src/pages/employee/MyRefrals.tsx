import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGetMyReferralsQuery } from "@/store/api/refralApi";
import type { Referral, ReferralStatus } from "@/store/api/refralApi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  XCircle,
  Gift,
  Search,
  Filter,
  Plus,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

// ─── Points config (per status) ───────────────────────────────────────────────
// Points are awarded based on how far a referral progresses.
// under_review and interview_scheduled are milestone points (partial).
// hired is the full reward. rejected = 0.

const STATUS_POINTS: Record<ReferralStatus, number> = {
  submitted: 10, // submitted = 10 pts for taking action
  under_review: 25, // HR looked at it = 25 pts
  interview_scheduled: 75, // candidate got interview = 75 pts
  hired: 200, // hired = full reward
  rejected: 0,
};

const STATUS_CONFIG: Record<
  ReferralStatus,
  { label: string; color: string; bg: string; dot: string; icon: LucideIcon }
> = {
  submitted: {
    label: "Submitted",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    dot: "bg-blue-500",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    dot: "bg-amber-500",
    icon: AlertCircle,
  },
  interview_scheduled: {
    label: "Interview Scheduled",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    dot: "bg-purple-500",
    icon: Calendar,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
    dot: "bg-red-500",
    icon: XCircle,
  },
  hired: {
    label: "Hired 🎉",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    dot: "bg-emerald-500",
    icon: CheckCircle,
  },
};

// Journey steps shown on each card
const JOURNEY: { status: ReferralStatus; label: string }[] = [
  { status: "submitted", label: "Submitted" },
  { status: "under_review", label: "Reviewed" },
  { status: "interview_scheduled", label: "Interview" },
  { status: "hired", label: "Hired" },
];

const statusOrder: Record<ReferralStatus, number> = {
  submitted: 0,
  under_review: 1,
  interview_scheduled: 2,
  hired: 3,
  rejected: -1,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Referral Card ────────────────────────────────────────────────────────────

function ReferralCard({
  referral,
  index,
}: {
  referral: Referral;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const cfg = STATUS_CONFIG[referral.status];
  const StatusIcon = cfg.icon;
  const points = STATUS_POINTS[referral.status];
  const currentStep = statusOrder[referral.status];
  const isRejected = referral.status === "rejected";

  const aiScore = referral.aiEvaluation?.summary?.score;
  const aiVerdict = referral.aiEvaluation?.summary?.verdict;
  const matched = referral.aiEvaluation?.skills?.matched ?? [];
  const missing = referral.aiEvaluation?.skills?.missing ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Main row */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
            <span className="text-sm font-bold text-primary">
              {getInitials(referral.candidateName)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h3 className="font-semibold text-foreground leading-tight">
                  {referral.candidateName}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {referral.job?.title || "—"}
                  {referral.job?.location && (
                    <span className="text-xs ml-2 text-muted-foreground/70">
                      · {referral.job.location}
                    </span>
                  )}
                </p>
              </div>

              {/* Points badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    points > 0
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Star
                    size={11}
                    className={points > 0 ? "fill-primary" : ""}
                  />
                  {points > 0 ? `+${points} pts` : "0 pts"}
                </div>
              </div>
            </div>

            {/* Status + date row */}
            <div className="flex items-center gap-3 flex-wrap mt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
              >
                <StatusIcon size={11} />
                {cfg.label}
              </span>
              <span className="text-xs text-muted-foreground">
                Submitted {formatDate(referral.createdAt)}
              </span>
              {aiScore !== undefined && aiScore !== null && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    aiScore >= 70
                      ? "bg-emerald-100 text-emerald-700"
                      : aiScore >= 50
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  AI: {aiScore}%
                </span>
              )}
            </div>

            {/* Progress journey (not for rejected) */}
            {!isRejected && (
              <div className="flex items-center gap-0 mt-3">
                {JOURNEY.map((step, i) => {
                  const done = currentStep >= statusOrder[step.status];
                  const active = currentStep === statusOrder[step.status];
                  return (
                    <div key={step.status} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${
                            done
                              ? "bg-primary border-primary"
                              : "bg-card border-muted-foreground/30"
                          } ${active ? "ring-2 ring-primary/30" : ""}`}
                        >
                          {done && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className={`text-[10px] mt-1 font-medium ${
                            done ? "text-primary" : "text-muted-foreground/50"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {i < JOURNEY.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mb-3 ${
                            currentStep > statusOrder[step.status]
                              ? "bg-primary"
                              : "bg-muted-foreground/20"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isRejected && (
              <p className="text-xs text-red-500 mt-2 font-medium">
                This referral was not shortlisted.
              </p>
            )}
          </div>

          {/* Expand toggle */}
          <button className="p-1 hover:bg-muted rounded-lg transition-colors shrink-0 mt-0.5">
            {expanded ? (
              <ChevronUp size={16} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={16} className="text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t px-5 py-4 space-y-4 bg-muted/20">
              {/* Contact + resume */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <a
                    href={`mailto:${referral.candidateEmail}`}
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {referral.candidateEmail}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="text-sm font-medium">
                    {referral.candidatePhone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Resume</p>
                  <a
                    href={referral.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText size={13} /> View Resume
                  </a>
                </div>
              </div>

              {/* AI evaluation if available */}
              {referral.aiEvaluation?.summary?.score !== undefined && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    AI Evaluation
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {matched.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full capitalize"
                      >
                        ✓ {s}
                      </span>
                    ))}
                    {missing.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full capitalize"
                      >
                        ✗ {s}
                      </span>
                    ))}
                  </div>
                  {aiVerdict && (
                    <p className="text-xs text-muted-foreground">
                      Verdict:{" "}
                      <span className="font-medium text-foreground">
                        {aiVerdict}
                      </span>
                      {referral.aiEvaluation.recommendation && (
                        <>
                          {" "}
                          · Recommendation:{" "}
                          <span className="font-medium text-foreground">
                            {referral.aiEvaluation.recommendation}
                          </span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Action history */}
              {referral.actionHistory && referral.actionHistory.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Activity
                  </p>
                  <div className="space-y-1.5">
                    {referral.actionHistory.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                        <span className="capitalize font-medium text-foreground">
                          {a.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(a.actionAt)}
                        </span>
                        {a.remarks && (
                          <span className="text-muted-foreground italic">
                            · {a.remarks}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {referral.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Your Notes
                  </p>
                  <p className="text-sm text-muted-foreground italic bg-muted/50 rounded-lg px-3 py-2">
                    {referral.notes}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const MyReferrals = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: referrals = [], isLoading, isError } = useGetMyReferralsQuery();

  useEffect(() => {
    if (isError) toast.error("Failed to load your referrals.");
  }, [isError]);

  // ── computed stats from real data ──────────────────────────────────────────
  const totalPoints = referrals.reduce(
    (sum, r) => sum + STATUS_POINTS[r.status],
    0,
  );
  const hiredCount = referrals.filter((r) => r.status === "hired").length;
  const pendingCount = referrals.filter(
    (r) => r.status === "submitted" || r.status === "under_review",
  ).length;
  const interviewCount = referrals.filter(
    (r) => r.status === "interview_scheduled",
  ).length;

  // Points breakdown for the progress widget
  const pointsBreakdown = [
    {
      label: "Submitted",
      pts: STATUS_POINTS.submitted,
      count: referrals.filter((r) => r.status === "submitted").length,
    },
    {
      label: "Under Review",
      pts: STATUS_POINTS.under_review,
      count: referrals.filter((r) => r.status === "under_review").length,
    },
    {
      label: "Interview",
      pts: STATUS_POINTS.interview_scheduled,
      count: referrals.filter((r) => r.status === "interview_scheduled").length,
    },
    { label: "Hired", pts: STATUS_POINTS.hired, count: hiredCount },
  ];

  // ── filter ─────────────────────────────────────────────────────────────────
  const filtered = referrals.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      r.candidateName.toLowerCase().includes(q) ||
      (r.job?.title ?? "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Loading your referrals…
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">
            Failed to load referrals. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            My Referrals
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your referrals and earn reward points for successful hires
          </p>
        </div>
        <button
          onClick={() => navigate("/browse-jobs")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-semibold shrink-0"
        >
          <Plus size={16} />
          New Referral
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total points — hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1 bg-primary rounded-2xl p-5 text-primary-foreground relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <Star size={18} className="fill-white text-white" />
            </div>
            <p className="text-3xl font-bold">{totalPoints}</p>
            <p className="text-sm text-white/80 mt-0.5">Total Points</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-card border rounded-2xl p-5"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center mb-3">
            <Users size={16} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{referrals.length}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Total Referrals
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-card border rounded-2xl p-5"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mb-3">
            <CheckCircle size={16} className="text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">{hiredCount}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Successfully Hired
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-card border rounded-2xl p-5"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center mb-3">
            <Clock size={16} className="text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-600">
            {pendingCount + interviewCount}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">In Progress</p>
        </motion.div>
      </div>

      {/* Points breakdown widget */}
      {referrals.length > 0 && (
        <div className="bg-card border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={15} className="text-primary" />
            <h2 className="text-sm font-semibold">How You Earn Points</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pointsBreakdown.map((b) => (
              <div
                key={b.label}
                className="p-3 bg-muted/40 rounded-xl text-center"
              >
                <p className="text-lg font-bold text-primary">+{b.pts}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {b.label}
                </p>
                {b.count > 0 && (
                  <p className="text-xs font-semibold text-foreground mt-1">
                    {b.count}× = {b.count * b.pts} pts
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Points are awarded at each milestone. Getting a candidate hired
            gives the most points.
          </p>
        </div>
      )}

      {/* Hired reward banner */}
      {hiredCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
              <Gift size={22} className="text-emerald-600" />
            </div>

            {/* Text */}
            <div>
              <h3 className="font-semibold text-foreground">
                {hiredCount === 1
                  ? "🎉 You got someone hired!"
                  : `🎉 ${hiredCount} of your referrals were hired!`}
              </h3>

              <p className="text-sm text-muted-foreground mt-0.5">
                You've earned{" "}
                <span className="font-semibold text-emerald-600">
                  {hiredCount * STATUS_POINTS.hired} points
                </span>{" "}
                from successful hires.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-card border rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by candidate name or position…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="relative md:w-52">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Referral cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-5">
            <Users size={36} className="text-muted-foreground opacity-40" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {referrals.length === 0 ? "No Referrals Yet" : "No Results"}
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            {referrals.length === 0
              ? "Start referring candidates and earn reward points!"
              : "Try adjusting your search or filter."}
          </p>
          {referrals.length === 0 && (
            <button
              onClick={() => navigate("/browse-jobs")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              Make Your First Referral
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((referral, i) => (
            <ReferralCard key={referral._id} referral={referral} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReferrals;
