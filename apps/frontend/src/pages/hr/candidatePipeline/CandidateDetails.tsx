import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  useGetAllReferralsQuery,
  useUpdateReferralMutation,
} from "@/store/api/refralApi";
import type { Referral, ReferralStatus } from "@/store/api/refralApi";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
  MessageSquare,
  MoreVertical,
  Edit,
  Share2,
  Users,
  X,
  History,
  type LucideIcon,
} from "lucide-react";

interface ReferredBy {
  _id: string;
  name: string;
  email: string;
}

// Status configuration
const statusConfig: Record<
  ReferralStatus,
  { label: string; color: string; bg: string; icon: LucideIcon }
> = {
  submitted: {
    label: "Submitted",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    icon: AlertCircle,
  },
  interview_scheduled: {
    label: "Interview Scheduled",
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    icon: Calendar,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
  hired: {
    label: "Hired",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    icon: CheckCircle2,
  },
};

const calculateATSScore = (ai?: Referral["aiEvaluation"]) => {
  if (!ai) return 0;
  if (ai.summary?.score != null) return Math.round(ai.summary.score);
  const flatScores = [ai.keyword_score, ai.skills_score, ai.exp_score];
  if (flatScores.some((s) => s != null)) {
    const filled = flatScores.filter((s) => s != null) as number[];
    return Math.round(filled.reduce((a, b) => a + b, 0) / filled.length);
  }
  if (ai.skills?.match_percentage != null)
    return Math.round(ai.skills.match_percentage);
  return 0;
};

const hasEvaluationScores = (ai: Referral["aiEvaluation"]): boolean => {
  if (!ai) return false;
  const hasFlatScores =
    ai.keyword_score != null || ai.skills_score != null || ai.exp_score != null;
  const hasNestedScores =
    ai.summary?.score != null || ai.skills?.match_percentage != null;
  return hasFlatScores || hasNestedScores;
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

const recommendationMeta = (rec?: string) => {
  if (!rec) return { label: "Pending", color: "bg-gray-100 text-gray-600" };
  const value = rec.toLowerCase();
  if (value.includes("hire"))
    return { label: rec, color: "bg-green-100 text-green-700" };
  if (value.includes("interview"))
    return { label: rec, color: "bg-yellow-100 text-yellow-700" };
  if (value.includes("reject"))
    return { label: rec, color: "bg-red-100 text-red-700" };
  return { label: rec, color: "bg-blue-100 text-blue-700" };
};

const formatInterviewDate = (date: string) =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const CandidateDetails = () => {
  const [interviewDate, setInterviewDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "notes">(
    "overview",
  );
  const [actionRemarks, setActionRemarks] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    data: referrals = [],
    isLoading,
    isError,
    refetch,
  } = useGetAllReferralsQuery();
  const [updateReferral] = useUpdateReferralMutation();

  const referral = referrals.find((r: Referral) => r._id === id);

  const handleStatusUpdate = async (action: string, remarks?: string) => {
    if (!id) {
      toast.error("Invalid candidate ID");
      return;
    }
    try {
      await updateReferral({
        id,
        data: { action, remarks: remarks || actionRemarks },
      }).unwrap();
      toast.success("Referral updated successfully");
      setActionRemarks("");
      refetch();
    } catch {
      toast.error("Failed to update referral status");
    }
  };

  const handleReject = async () => {
    await handleStatusUpdate("rejected", actionRemarks);
  };

  useEffect(() => {
    console.log("All Referrals API Response:", referrals);
  }, [referrals]);

  const handleHire = async () => {
    await handleStatusUpdate("hired", actionRemarks);
  };

  const handleSendEmail = () => {
    if (referral?.candidateEmail) {
      window.location.href = `mailto:${referral.candidateEmail}`;
      toast.success("Opening email client...");
    }
  };

  const handleScheduleInterviewClick = () => {
    setIsModalOpen(true);
  };

  const [isScheduling, setIsScheduling] = useState(false);

  const handleConfirmSchedule = async () => {
    if (!interviewDate) {
      toast.error("Please select a date and time for the interview");
      return;
    }
    if (!id) {
      toast.error("Invalid candidate ID");
      return;
    }
    setIsScheduling(true);
    try {
      await updateReferral({
        id,
        data: {
          action: "interview_scheduled",
          remarks: actionRemarks,
          interviewDate,
        },
      }).unwrap();
      toast.success("Interview Scheduled Successfully");
      setIsModalOpen(false);
      setInterviewDate("");
      setActionRemarks("");
      refetch();
    } catch (error) {
      toast.error("Failed to schedule interview");
      console.log(error);
    } finally {
      setIsScheduling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Failed to Load Data
          </h2>
          <p className="text-muted-foreground mb-6">
            We couldn't retrieve the candidate information. Please try again.
          </p>
          <button
            onClick={() => navigate("/candidates")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Pipeline
          </button>
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <XCircle size={48} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Candidate Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The candidate you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/candidates")}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Back to Pipeline
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig[referral.status];
  const StatusIcon = status.icon;

  const initials = referral.candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-400 mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/candidates")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{referral.candidateName}</h1>
              <p className="text-sm text-muted-foreground">
                Applied for {referral.job?.title || "Unknown Position"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Share2 size={18} />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Edit size={18} />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-2xl p-6"
            >
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {initials}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {referral.candidateName}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {referral.job?.title || "Position Not Specified"}
                  </p>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${status.bg}`}
                  >
                    <StatusIcon size={16} className={status.color} />
                    <span className={`text-sm font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Email
                    </p>
                    <p className="text-sm font-medium">
                      {referral.candidateEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Phone
                    </p>
                    <p className="text-sm font-medium">
                      {referral.candidatePhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Location
                    </p>
                    <p className="text-sm font-medium">
                      {referral.job?.location || "Not Specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Applied On
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(referral.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </p>
                  </div>
                </div>

                {/* ✅ Interview Date in profile card */}
                {referral.interviewDate && (
                  <div className="flex items-center gap-3 col-span-2">
                    <Calendar size={18} className="text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Interview Scheduled
                      </p>
                      <p className="text-sm font-medium text-purple-600">
                        {formatInterviewDate(referral.interviewDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border rounded-2xl overflow-hidden"
            >
              <div className="flex border-b">
                {[
                  {
                    id: "overview" as const,
                    label: "Overview",
                    icon: FileText,
                  },
                  { id: "timeline" as const, label: "Timeline", icon: History },
                  { id: "notes" as const, label: "Notes", icon: MessageSquare },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-6 py-4 font-medium transition-colors relative ${
                        activeTab === tab.id
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Icon size={18} />
                        {tab.label}
                      </div>
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Briefcase size={18} className="text-primary" />
                        Position Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Title</span>
                          <span className="font-medium">
                            {referral.job?.title || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Location
                          </span>
                          <span className="font-medium">
                            {referral.job?.location || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-muted-foreground">Job ID</span>
                          <span className="font-mono text-xs">
                            {referral.job?._id || "—"}
                          </span>
                        </div>
                        {/* ✅ Interview date in overview tab */}
                        <div className="flex justify-between col-span-2">
                          <span className="text-muted-foreground">
                            Interview Date
                          </span>
                          <span
                            className={`font-medium ${referral.interviewDate ? "text-purple-600" : ""}`}
                          >
                            {referral.interviewDate
                              ? formatInterviewDate(referral.interviewDate)
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Users size={18} className="text-primary" />
                        Referral Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Referred By
                          </span>
                          <span className="font-medium">
                            {(referral.referredBy as ReferredBy)?.name || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Referrer Email
                          </span>
                          <span className="font-medium">
                            {(referral.referredBy as ReferredBy)?.email || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Relationship
                          </span>
                          <span className="font-medium">
                            {referral.relationship || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {referral.resume && (
                      <div className="border-t pt-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <FileText size={18} className="text-primary" />
                          Resume
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                          <div className="flex items-center gap-3">
                            <FileText size={20} className="text-primary" />
                            <div>
                              <p className="font-medium text-sm">Resume.pdf</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded on{" "}
                                {new Date(
                                  referral.createdAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2">
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "timeline" && (
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <History size={18} className="text-primary" />
                      Action History
                    </h3>

                    {referral.actionHistory &&
                    referral.actionHistory.length > 0 ? (
                      <div className="relative space-y-6">
                        {referral.actionHistory.map((action, index) => (
                          <div key={index} className="relative flex gap-4">
                            {index !== referral.actionHistory!.length - 1 && (
                              <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                            )}
                            <div className="relative shrink-0">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  action.action === "interview_scheduled"
                                    ? "bg-purple-100"
                                    : "bg-primary/10"
                                }`}
                              >
                                {action.action === "interview_scheduled" ? (
                                  <Calendar
                                    size={18}
                                    className="text-purple-600"
                                  />
                                ) : (
                                  <Clock size={18} className="text-primary" />
                                )}
                              </div>
                            </div>

                            <div className="flex-1 pb-8">
                              <div
                                className={`rounded-xl p-4 border ${
                                  action.action === "interview_scheduled"
                                    ? "bg-purple-50 border-purple-200"
                                    : "bg-muted/30"
                                }`}
                              >
                                <p className="font-medium mb-1 capitalize">
                                  {action.action.replace(/_/g, " ")}
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {new Date(action.actionAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Action performed by:{" "}
                                  {(action.actionBy as { name: string })
                                    ?.name ||
                                    (action.actionBy as { email: string })
                                      ?.email ||
                                    "Unknown"}
                                </p>

                                {/* ✅ Show interview date inside the timeline event */}
                                {action.action === "interview_scheduled" &&
                                  referral.interviewDate && (
                                    <div className="mt-3 flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-purple-200 w-fit">
                                      <Calendar
                                        size={14}
                                        className="text-purple-600 shrink-0"
                                      />
                                      <span className="text-sm font-medium text-purple-700">
                                        {formatInterviewDate(
                                          referral.interviewDate,
                                        )}
                                      </span>
                                    </div>
                                  )}

                                {action.remarks && (
                                  <div className="mt-2 text-xs text-muted-foreground italic">
                                    Remarks: {action.remarks}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <History
                          size={48}
                          className="mx-auto mb-3 opacity-20"
                        />
                        <p>No timeline events yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "notes" && (
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare size={18} className="text-primary" />
                      Referral Notes
                    </h3>
                    {referral.notes ? (
                      <div className="bg-muted/30 rounded-xl p-4 border">
                        <p className="text-sm whitespace-pre-wrap">
                          {referral.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare
                          size={48}
                          className="mx-auto mb-3 opacity-20"
                        />
                        <p>No notes available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* ATS Scan Result */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-card border rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                ATS Scan Result
              </h3>

              {referral.aiEvaluation ? (
                (() => {
                  const ai = referral.aiEvaluation;
                  const ats = calculateATSScore(ai);
                  const matchedSkills =
                    ai.matched_keywords ?? ai.skills?.matched ?? [];
                  const missingSkills =
                    ai.missing_keywords ?? ai.skills?.missing ?? [];
                  const candidateYears =
                    ai.resume_years ?? ai.experience?.candidate_years ?? 0;
                  const requiredYears =
                    ai.jd_years ?? ai.experience?.required_years ?? 0;
                  const meta = recommendationMeta(ai.recommendation);

                  if (!hasEvaluationScores(ai)) {
                    return (
                      <div className="text-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">
                          AI evaluation in progress...
                        </p>
                        {ai.evaluatedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Evaluated at:{" "}
                            {new Date(ai.evaluatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-muted-foreground">
                            Overall Match
                          </span>
                          <span className={`font-bold ${scoreColor(ats)}`}>
                            {ats}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ats}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-full ${ats >= 80 ? "bg-green-500" : ats >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                          />
                        </div>
                      </div>

                      {(ai.keyword_score != null ||
                        ai.skills_score != null ||
                        ai.exp_score != null) && (
                        <div className="space-y-2 text-sm border-t pt-4">
                          {ai.keyword_score != null && (
                            <div className="flex justify-between">
                              <span>Keyword Match</span>
                              <span className="font-semibold">
                                {ai.keyword_score}%
                              </span>
                            </div>
                          )}
                          {ai.skills_score != null && (
                            <div className="flex justify-between">
                              <span>Skills Match</span>
                              <span className="font-semibold">
                                {ai.skills_score}%
                              </span>
                            </div>
                          )}
                          {ai.exp_score != null && (
                            <div className="flex justify-between">
                              <span>Experience Match</span>
                              <span className="font-semibold">
                                {ai.exp_score}%
                              </span>
                            </div>
                          )}
                          {ai.title_similarity != null && (
                            <div className="flex justify-between">
                              <span>Title Similarity</span>
                              <span className="font-semibold">
                                {ai.title_similarity}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {ai.keyword_score == null &&
                        ai.skills_score == null &&
                        ai.exp_score == null &&
                        ai.summary?.score != null && (
                          <div className="space-y-2 text-sm border-t pt-4">
                            <div className="flex justify-between">
                              <span>Score</span>
                              <span className="font-semibold">
                                {ai.summary.score}%
                              </span>
                            </div>
                            {ai.summary.verdict && (
                              <div className="flex justify-between">
                                <span>Verdict</span>
                                <span className="font-semibold capitalize">
                                  {ai.summary.verdict}
                                </span>
                              </div>
                            )}
                            {ai.summary.confidence && (
                              <div className="flex justify-between">
                                <span>Confidence</span>
                                <span className="font-semibold capitalize">
                                  {ai.summary.confidence}
                                </span>
                              </div>
                            )}
                            {ai.skills?.match_percentage != null && (
                              <div className="flex justify-between">
                                <span>Skills Match</span>
                                <span className="font-semibold">
                                  {ai.skills.match_percentage}%
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                      <div className="space-y-2 text-sm border-t pt-4">
                        <div className="flex justify-between">
                          <span>Candidate Experience</span>
                          <span className="font-semibold">
                            {candidateYears} yrs
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Required Experience</span>
                          <span className="font-semibold">
                            {requiredYears} yrs
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Meets Requirement</span>
                          <span
                            className={`font-semibold ${candidateYears >= requiredYears ? "text-green-600" : "text-red-600"}`}
                          >
                            {candidateYears >= requiredYears ? "Yes ✓" : "No ✗"}
                          </span>
                        </div>
                      </div>

                      {ai.recommendation && (
                        <div className="border-t pt-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            AI Recommendation
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Matched Keywords ({matchedSkills.length})
                        </p>
                        {matchedSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {matchedSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            None found
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Missing Keywords ({missingSkills.length})
                        </p>
                        {missingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {missingSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            None 🎉
                          </p>
                        )}
                      </div>

                      {ai.risk_flags?.length ? (
                        <div className="border-t pt-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            Risk Analysis
                          </p>
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                            {ai.risk_flags.map((flag, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-sm text-red-700"
                              >
                                <AlertCircle size={16} className="mt-0.5" />
                                <span>{flag}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {ai.llm_explanation && (
                        <div className="border-t pt-4">
                          <button
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {showExplanation
                              ? "Hide AI Explanation"
                              : "View AI Explanation"}
                          </button>
                          {showExplanation && (
                            <div className="mt-3 bg-muted/30 rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed">
                              {ai.llm_explanation}
                            </div>
                          )}
                        </div>
                      )}

                      {ai.evaluatedAt && (
                        <p className="text-xs text-muted-foreground pt-2">
                          Last scanned on{" "}
                          {new Date(ai.evaluatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  ATS evaluation pending…
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {referral?.status === "submitted" ||
                referral?.status === "under_review" ? (
                  <>
                    <button
                      onClick={handleScheduleInterviewClick}
                      className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Calendar size={18} />
                      Schedule Interview
                    </button>
                    <button
                      onClick={handleReject}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject Candidate
                    </button>
                  </>
                ) : referral?.status === "interview_scheduled" ? (
                  <>
                    <button
                      onClick={handleHire}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Mark as Hired
                    </button>
                    <button
                      onClick={handleReject}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject After Interview
                    </button>
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No actions available for this status
                  </div>
                )}
                <button
                  onClick={handleSendEmail}
                  className="w-full px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Mail size={18} />
                  Send Email
                </button>
              </div>
            </motion.div>

            {/* Remarks */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card border rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                Add Remarks
              </h3>
              <textarea
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                placeholder="Add notes or remarks..."
              />
            </motion.div>

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Current Status</h3>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border">
                {referral &&
                  (() => {
                    const config = statusConfig[referral.status];
                    const Icon = config.icon;
                    return (
                      <>
                        <Icon size={24} className={config.color} />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <p className={`font-semibold ${config.color}`}>
                            {config.label}
                          </p>
                        </div>
                      </>
                    );
                  })()}
              </div>

              {/* ✅ Interview date in status card */}
              {referral.status === "interview_scheduled" &&
                referral.interviewDate && (
                  <div className="mt-3 flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <Calendar size={16} className="text-purple-600 shrink-0" />
                    <div>
                      <p className="text-xs text-purple-500">
                        Interview Scheduled For
                      </p>
                      <p className="text-sm font-semibold text-purple-700">
                        {formatInterviewDate(referral.interviewDate)}
                      </p>
                    </div>
                  </div>
                )}
            </motion.div>

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Metadata</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(referral.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">
                    {new Date(referral.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Candidate ID</span>
                  <span className="font-mono text-xs">{referral._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deleted</span>
                  <span
                    className={`font-medium ${referral.deleted ? "text-red-600" : "text-green-600"}`}
                  >
                    {referral.deleted ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Schedule Interview</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isScheduling ? "Scheduling..." : "Schedule Interview"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
