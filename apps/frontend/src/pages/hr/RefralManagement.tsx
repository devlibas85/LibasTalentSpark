import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  XCircle,
  Clock,
  Award,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  Briefcase,
  TrendingUp,
  X,
  Shield,
  Zap,
  Target,
} from "lucide-react";
import {
  useGetAllReferralsQuery,
  useUpdateReferralMutation,
  type Referral,
  type AIEvaluation,
} from "../../store/api/refralApi";
import { toast } from "sonner";

// ─── helpers ────────────────────────────────────────────────────────────────

const getStatusConfig = (status: string) => {
  switch (status) {
    case "submitted":
      return {
        label: "Submitted",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        dot: "bg-blue-500",
        icon: Clock,
      };
    case "under_review":
      return {
        label: "Under Review",
        color:
          "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        dot: "bg-amber-500",
        icon: Eye,
      };
    case "interview_scheduled":
      return {
        label: "Interview Scheduled",
        color:
          "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
        dot: "bg-purple-500",
        icon: Calendar,
      };
    case "rejected":
      return {
        label: "Rejected",
        color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
        dot: "bg-red-500",
        icon: XCircle,
      };
    case "hired":
      return {
        label: "Hired",
        color:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        dot: "bg-emerald-500",
        icon: Award,
      };
    default:
      return {
        label: status,
        color: "bg-gray-100 text-gray-700",
        dot: "bg-gray-400",
        icon: Clock,
      };
  }
};

const getRelationshipConfig = (rel: string) => {
  const map: Record<string, { label: string; color: string }> = {
    friend: { label: "Friend", color: "bg-sky-100 text-sky-700" },
    former_colleague: {
      label: "Ex-Colleague",
      color: "bg-violet-100 text-violet-700",
    },
    family: { label: "Family", color: "bg-rose-100 text-rose-700" },
    acquaintance: {
      label: "Acquaintance",
      color: "bg-orange-100 text-orange-700",
    },
    other: { label: "Other", color: "bg-gray-100 text-gray-700" },
  };
  return map[rel] ?? { label: rel, color: "bg-gray-100 text-gray-700" };
};

const getAiScoreMeta = (ai?: AIEvaluation) => {
  const score = ai?.summary?.score;
  if (score === undefined || score === null)
    return {
      label: "Pending",
      bar: "bg-gray-300",
      text: "text-gray-500",
      pct: 0,
    };
  if (score >= 70)
    return {
      label: `${score}%`,
      bar: "bg-emerald-500",
      text: "text-emerald-700",
      pct: score,
    };
  if (score >= 50)
    return {
      label: `${score}%`,
      bar: "bg-amber-500",
      text: "text-amber-700",
      pct: score,
    };
  return {
    label: `${score}%`,
    bar: "bg-red-500",
    text: "text-red-700",
    pct: score,
  };
};

// ─── Referrer Leaderboard dropdown ──────────────────────────────────────────

function ReferrerLeaderboard({ referrals }: { referrals: Referral[] }) {
  const [open, setOpen] = useState(false);

  const leaderboard = useMemo(() => {
    const map = new Map<
      string,
      { name: string; email: string; total: number; hired: number }
    >();
    referrals.forEach((r) => {
      const key = r.referredBy._id;
      const prev = map.get(key) ?? {
        name: r.referredBy.name,
        email: r.referredBy.email,
        total: 0,
        hired: 0,
      };
      map.set(key, {
        ...prev,
        total: prev.total + 1,
        hired: prev.hired + (r.status === "hired" ? 1 : 0),
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [referrals]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${open ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted border-input"}`}
      >
        <TrendingUp size={15} />
        Top Referrers
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* backdrop to close on outside click */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-20 w-80 bg-card border rounded-xl shadow-lg p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Leaderboard
              </p>
              <div className="space-y-3">
                {leaderboard.map((r, i) => (
                  <div key={r.email} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {r.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.total} referrals · {r.hired} hired
                      </p>
                    </div>
                    {r.hired > 0 && (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {Math.round((r.hired / r.total) * 100)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── AI Evaluation panel inside modal ───────────────────────────────────────

function AIEvaluationPanel({ ai }: { ai: AIEvaluation }) {
  const score = ai.summary?.score;
  const verdict = ai.summary?.verdict;
  const confidence = ai.summary?.confidence;
  const matched = ai.skills?.matched ?? [];
  const missing = ai.skills?.missing ?? [];
  const criticalGap = ai.skills?.critical_gap;
  const matchPct = ai.skills?.match_percentage ?? 0;
  const exp = ai.experience;
  const riskFlags = ai.risk_flags ?? [];
  const recommendation = ai.recommendation;

  const recColor =
    recommendation === "Shortlist"
      ? "bg-emerald-100 text-emerald-700"
      : recommendation === "Review"
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700";

  return (
    <div className="space-y-4">
      {/* Score + verdict */}
      <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke={
                score !== undefined && score >= 70
                  ? "#10b981"
                  : score !== undefined && score >= 50
                    ? "#f59e0b"
                    : "#ef4444"
              }
              strokeWidth="3"
              strokeDasharray={`${score ?? 0} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {score ?? "—"}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-lg">{verdict ?? "Pending"}</p>
          {confidence && (
            <p className="text-xs text-muted-foreground">
              Confidence: {confidence}
            </p>
          )}
          <span
            className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${recColor}`}
          >
            {recommendation ?? "—"}
          </span>
        </div>
      </div>

      {/* Experience */}
      {exp && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-0.5">
              Candidate Exp
            </p>
            <p className="font-semibold">{exp.candidate_years ?? 0} yrs</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-0.5">Required Exp</p>
            <p className="font-semibold">{exp.required_years ?? 0} yrs</p>
          </div>
          <div className="col-span-2 flex flex-wrap gap-2">
            {exp.meets_requirement && (
              <span className="text-xs flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} /> Meets requirement
              </span>
            )}
            {exp.career_break_detected && (
              <span className="text-xs flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                <AlertTriangle size={11} /> Career break detected
              </span>
            )}
            {exp.overqualified_flag && (
              <span className="text-xs flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                <Shield size={11} /> Overqualified
              </span>
            )}
          </div>
        </div>
      )}

      {/* Skills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Skills Match</p>
          <span className="text-xs font-semibold">{matchPct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full ${matchPct >= 70 ? "bg-emerald-500" : matchPct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${matchPct}%` }}
          />
        </div>
        {matched.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground mb-1.5">Matched</p>
            <div className="flex flex-wrap gap-1.5">
              {matched.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full capitalize"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {missing.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">
              Missing{" "}
              {criticalGap && (
                <span className="text-red-500 font-medium">(Critical)</span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missing.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full capitalize"
                >
                  ✗ {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk flags */}
      {riskFlags.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs font-semibold text-red-700 mb-1.5 flex items-center gap-1">
            <AlertTriangle size={12} /> Risk Flags
          </p>
          <ul className="space-y-0.5">
            {riskFlags.map((f, i) => (
              <li key={i} className="text-xs text-red-600">
                • {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Timeline ───────────────────────────────────────────────────────────────

function Timeline({ history }: { history: Referral["actionHistory"] }) {
  if (!history || history.length === 0) return null;
  return (
    <div className="space-y-1">
      {history.map((item, i) => {
        const isLast = i === history.length - 1;
        const actorName =
          typeof item.actionBy === "object"
            ? (item.actionBy.name ?? "System")
            : "System";
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${isLast ? "bg-primary" : "bg-muted-foreground/40"}`}
              />
              {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium capitalize">
                {item.action.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {actorName} · {new Date(item.actionAt).toLocaleString()}
              </p>
              {item.remarks && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">
                  "{item.remarks}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Detail Modal ────────────────────────────────────────────────────────────

function DetailModal({
  referral,
  onClose,
  onAction,
  actionRemarks,
  setActionRemarks,
}: {
  referral: Referral;
  onClose: () => void;
  onAction: (id: string, action: string, remarks?: string) => void;
  actionRemarks: string;
  setActionRemarks: (v: string) => void;
}) {
  const [tab, setTab] = useState<"overview" | "ai" | "timeline">("overview");
  const statusCfg = getStatusConfig(referral.status);
  const relCfg = getRelationshipConfig(referral.relationship);
  const aiScore = getAiScoreMeta(referral.aiEvaluation);

  const canAct = referral.status !== "rejected" && referral.status !== "hired";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-card border rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="p-6 border-b shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-base font-bold text-primary">
                  {referral.candidateName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {referral.candidateName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {referral.job.title} · {referral.job.location}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}
                  >
                    <statusCfg.icon size={11} /> {statusCfg.label}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${relCfg.color}`}
                  >
                    {relCfg.label} of {referral.referredBy.name}
                  </span>
                  {referral.aiEvaluation?.summary?.score !== undefined && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${aiScore.text} bg-muted`}
                    >
                      AI: {aiScore.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 bg-muted/50 rounded-lg p-1 w-fit">
            {(["overview", "ai", "timeline"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "ai"
                  ? "AI Evaluation"
                  : t === "timeline"
                    ? "Timeline"
                    : "Overview"}
              </button>
            ))}
          </div>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Candidate */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Candidate
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail
                      size={14}
                      className="text-muted-foreground shrink-0"
                    />
                    <a
                      href={`mailto:${referral.candidateEmail}`}
                      className="text-primary hover:underline truncate"
                    >
                      {referral.candidateEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone
                      size={14}
                      className="text-muted-foreground shrink-0"
                    />
                    <a
                      href={`tel:${referral.candidatePhone}`}
                      className="hover:underline"
                    >
                      {referral.candidatePhone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText
                      size={14}
                      className="text-muted-foreground shrink-0"
                    />
                    <a
                      href={referral.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Resume
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users
                      size={14}
                      className="text-muted-foreground shrink-0"
                    />
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${relCfg.color}`}
                    >
                      {relCfg.label}
                    </span>
                  </div>
                </div>
                {referral.notes && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Referrer Notes
                    </p>
                    <p className="text-sm bg-muted/50 rounded-lg p-3 text-muted-foreground italic whitespace-pre-wrap line-clamp-5">
                      {referral.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Referrer + Job */}
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Referred By
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {referral.referredBy.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {referral.referredBy.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {referral.referredBy.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Position
                  </p>
                  <div className="p-3 bg-muted/30 rounded-xl">
                    <p className="font-medium text-sm flex items-center gap-2">
                      <Briefcase size={14} className="text-muted-foreground" />
                      {referral.job.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 ml-5">
                      {referral.job.location}
                    </p>
                    {referral.job.department && (
                      <p className="text-xs text-muted-foreground ml-5">
                        {referral.job.department}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Submitted
                  </p>
                  <p className="text-sm">
                    {new Date(referral.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "ai" &&
            (referral.aiEvaluation ? (
              <AIEvaluationPanel ai={referral.aiEvaluation} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Zap size={32} className="opacity-30" />
                <p className="text-sm">AI evaluation not available yet</p>
              </div>
            ))}

          {tab === "timeline" && <Timeline history={referral.actionHistory} />}
        </div>

        {/* Actions footer */}
        {canAct && (
          <div className="border-t p-6 shrink-0 space-y-4">
            <textarea
              value={actionRemarks}
              onChange={(e) => setActionRemarks(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
              placeholder="Add remarks for this action (optional)..."
            />
            <div className="flex gap-3 flex-wrap">
              {(referral.status === "submitted" ||
                referral.status === "under_review") && (
                <>
                  <button
                    onClick={() =>
                      onAction(referral._id, "interview_scheduled")
                    }
                    className="flex-1 min-w-35 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    <Calendar size={15} /> Schedule Interview
                  </button>
                  <button
                    onClick={() => onAction(referral._id, "rejected")}
                    className="flex-1 min-w-30 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <ThumbsDown size={15} /> Reject
                  </button>
                </>
              )}
              {referral.status === "interview_scheduled" && (
                <>
                  <button
                    onClick={() => onAction(referral._id, "hired")}
                    className="flex-1 min-w-30 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium"
                  >
                    <ThumbsUp size={15} /> Mark Hired
                  </button>
                  <button
                    onClick={() => onAction(referral._id, "rejected")}
                    className="flex-1 min-w-30 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <ThumbsDown size={15} /> Reject
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2.5 border rounded-xl hover:bg-muted transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {!canAct && (
          <div className="border-t p-4 shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border rounded-xl hover:bg-muted transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ReferralsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterJob, setFilterJob] = useState<string>("all");
  const [filterReferrer, setFilterReferrer] = useState<string>("all");
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [rejectConfirm, setRejectConfirm] = useState<string | null>(null);
  const [hireConfirm, setHireConfirm] = useState<string | null>(null);
  const [actionRemarks, setActionRemarks] = useState("");

  const {
    data: referrals = [],
    isLoading,
    refetch,
  } = useGetAllReferralsQuery();
  const [updateReferral] = useUpdateReferralMutation();

  // Derived filter options
  const uniqueJobs = useMemo(
    () => Array.from(new Set(referrals.map((r) => r.job.title))),
    [referrals],
  );

  const uniqueReferrers = useMemo(
    () =>
      Array.from(
        new Map(
          referrals.map((r) => [r.referredBy._id, r.referredBy.name]),
        ).entries(),
      ),
    [referrals],
  );

  const handleViewReferral = async (referralId: string) => {
    if (showDetails === referralId) {
      setShowDetails(null);
      return;
    }
    const referral = referrals.find((r) => r._id === referralId);
    if (referral?.status === "submitted") {
      try {
        await updateReferral({
          id: referralId,
          data: { action: "reviewed", remarks: "Viewed by HR" },
        }).unwrap();
      } catch {
        /* silent */
      }
    }
    setShowDetails(referralId);
  };

  const handleStatusUpdate = async (
    referralId: string,
    action: string,
    remarks?: string,
  ) => {
    try {
      await updateReferral({
        id: referralId,
        data: { action, remarks: remarks ?? actionRemarks },
      }).unwrap();
      toast.success("Referral updated successfully");
      setActionRemarks("");
      setShowDetails(null);
      refetch();
    } catch {
      toast.error("Failed to update referral");
    }
  };

  const filteredReferrals = useMemo(
    () =>
      referrals.filter((r) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          r.candidateName.toLowerCase().includes(q) ||
          r.referredBy.name.toLowerCase().includes(q) ||
          r.job.title.toLowerCase().includes(q) ||
          r.candidateEmail.toLowerCase().includes(q);
        const matchStatus = filterStatus === "all" || r.status === filterStatus;
        const matchJob = filterJob === "all" || r.job.title === filterJob;
        const matchReferrer =
          filterReferrer === "all" || r.referredBy._id === filterReferrer;
        return matchSearch && matchStatus && matchJob && matchReferrer;
      }),
    [referrals, searchQuery, filterStatus, filterJob, filterReferrer],
  );

  // Stats
  const stats = [
    {
      label: "Total",
      value: referrals.length,
      icon: UserPlus,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Review",
      value: referrals.filter(
        (r) => r.status === "submitted" || r.status === "under_review",
      ).length,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Interviewing",
      value: referrals.filter((r) => r.status === "interview_scheduled").length,
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "Hired",
      value: referrals.filter((r) => r.status === "hired").length,
      icon: Award,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Rejected",
      value: referrals.filter((r) => r.status === "rejected").length,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
  ];

  const selectedReferral = referrals.find((r) => r._id === showDetails) ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading referrals…
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
            Referrals Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review employee referrals, AI scores, and manage hiring decisions
          </p>
        </div>
        <div className="shrink-0 mt-1">
          <ReferrerLeaderboard referrals={referrals} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.bg}`}
              >
                <s.icon size={14} className={s.color} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main content: full width */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-card border rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <input
                type="text"
                placeholder="Search candidate, referrer, position…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none pr-8"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            <div className="relative">
              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none pr-8"
              >
                <option value="all">All Positions</option>
                {uniqueJobs.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>
          {/* Referrer filter as pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setFilterReferrer("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterReferrer === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}
            >
              All Referrers
            </button>
            {uniqueReferrers.map(([id, name]) => (
              <button
                key={id}
                onClick={() =>
                  setFilterReferrer(filterReferrer === id ? "all" : id)
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterReferrer === id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Referred By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Relationship
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReferrals.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No referrals match your filters.
                    </td>
                  </tr>
                )}
                {filteredReferrals.map((referral) => {
                  const statusCfg = getStatusConfig(referral.status);
                  const relCfg = getRelationshipConfig(referral.relationship);
                  const aiScore = getAiScoreMeta(referral.aiEvaluation);
                  const canQuickAct =
                    referral.status !== "rejected" &&
                    referral.status !== "hired";

                  return (
                    <motion.tr
                      key={referral._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Candidate */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {referral.candidateName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-tight">
                              {referral.candidateName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {referral.candidateEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium">
                          {referral.job.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {referral.job.location}
                        </p>
                      </td>

                      {/* Referred By */}
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium">
                          {referral.referredBy.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-35">
                          {referral.referredBy.email}
                        </p>
                      </td>

                      {/* Relationship */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${relCfg.color}`}
                        >
                          {relCfg.label}
                        </span>
                      </td>

                      {/* AI Score */}
                      <td className="px-4 py-3.5">
                        {referral.aiEvaluation?.summary?.score !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${aiScore.bar}`}
                                style={{ width: `${aiScore.pct}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-semibold ${aiScore.text}`}
                            >
                              {aiScore.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                          />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewReferral(referral._id)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                          {canQuickAct &&
                            (referral.status === "submitted" ||
                              referral.status === "under_review") && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      referral._id,
                                      "interview_scheduled",
                                    )
                                  }
                                  className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 transition-colors"
                                  title="Schedule Interview"
                                >
                                  <Calendar size={15} />
                                </button>
                                <button
                                  onClick={() => setRejectConfirm(referral._id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
                                  title="Reject"
                                >
                                  <ThumbsDown size={15} />
                                </button>
                              </>
                            )}
                          {referral.status === "interview_scheduled" && (
                            <>
                              <button
                                onClick={() => setHireConfirm(referral._id)}
                                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 transition-colors"
                                title="Mark Hired"
                              >
                                <ThumbsUp size={15} />
                              </button>
                              <button
                                onClick={() => setRejectConfirm(referral._id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
                                title="Reject"
                              >
                                <ThumbsDown size={15} />
                              </button>
                            </>
                          )}
                          <a
                            href={`mailto:${referral.candidateEmail}`}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                            title="Email"
                          >
                            <Mail size={15} />
                          </a>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredReferrals.length} of {referrals.length} referrals
            </p>
            <div className="flex items-center gap-2">
              <Target size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {referrals.filter((r) => r.status === "hired").length} hired ·{" "}
                {referrals.length > 0
                  ? Math.round(
                      (referrals.filter((r) => r.status === "hired").length /
                        referrals.length) *
                        100,
                    )
                  : 0}
                % success rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedReferral && (
          <DetailModal
            referral={selectedReferral}
            onClose={() => setShowDetails(null)}
            onAction={handleStatusUpdate}
            actionRemarks={actionRemarks}
            setActionRemarks={setActionRemarks}
          />
        )}
      </AnimatePresence>

      {/* Reject Confirm Modal */}
      <AnimatePresence>
        {rejectConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setRejectConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="bg-card border rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Reject Referral?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Are you sure you want to reject this candidate? Please
                    confirm this is not a misclick.
                  </p>
                </div>
                <button
                  onClick={() => setRejectConfirm(null)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectConfirm(null)}
                  className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(rejectConfirm, "rejected");
                    setRejectConfirm(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Yes, Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hire Confirm Modal */}
      <AnimatePresence>
        {hireConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setHireConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="bg-card border rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <ThumbsUp size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Mark as Hired?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This marks the candidate as hired — the final hiring
                    decision. Please confirm before proceeding.
                  </p>
                </div>
                <button
                  onClick={() => setHireConfirm(null)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setHireConfirm(null)}
                  className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(hireConfirm, "hired");
                    setHireConfirm(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  Yes, Mark Hired
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
