import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetAllReferralsQuery } from "@/store/refralApi";
import type { Referral, ReferralStatus } from "@/store/refralApi";
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
  Trash2,
  Share2,
  Star,
  Users,
  History,
  type LucideIcon,
} from "lucide-react";

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

  const scores = [
    ai.keyword_score,
    ai.skills_score,
    ai.exp_score,
    ai.title_similarity,
  ].filter((v): v is number => typeof v === "number");

  if (scores.length === 0) return 0;

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};


export const CandidateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "notes"
  >("overview");

  const { data: referrals = [], isLoading, isError } =
    useGetAllReferralsQuery();

  const referral = referrals.find((r: Referral) => r._id === id);

  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading candidate details...</p>
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
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            Candidate Not Found
          </h2>
          <p className="text-yellow-700 mb-4">
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
          onClick={() => navigate("/candidates")}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {referral.candidateName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Applied for {referral.job?.title || "Unknown Position"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
          <Share2 size={16} />
          Share
        </button>
        <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
          <Edit size={16} />
          Edit
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <MoreVertical size={20} />
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
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border ${status.bg}`}
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
                        <a
                          href={`mailto:${referral.candidateEmail}`}
                          className="text-sm font-medium hover:text-primary transition-colors"
                        >
                          {referral.candidateEmail}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <Phone size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${referral.candidatePhone}`}
                          className="text-sm font-medium hover:text-primary transition-colors"
                        >
                          {referral.candidatePhone}
                        </a>
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

            {/* Tabs */}
            <div className="bg-card border rounded-2xl overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b">
                {[
                  { id: "overview" as const, label: "Overview", icon: FileText },
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

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Job Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Briefcase size={20} className="text-primary" />
                        Position Details
                      </h3>
                      <div className="bg-muted/30 rounded-xl p-4 space-y-3">
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
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Job ID
                          </span>
                          <span className="font-mono text-sm">
                            {referral.job?._id || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Referral Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        Referral Information
                      </h3>
                      <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Referred By
                          </span>
                          <span className="font-medium">
                            {referral.referredBy?.name || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Referrer Email
                          </span>
                          <span className="font-medium">
                            {referral.referredBy?.email || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Relationship
                          </span>
                          <span className="font-medium capitalize">
                            {referral.relationship || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Resume */}
                    {referral.resume && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <FileText size={20} className="text-primary" />
                          Resume
                        </h3>
                        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                <FileText
                                  size={24}
                                  className="text-primary"
                                />
                              </div>
                              <div>
                                <p className="font-medium">Resume.pdf</p>
                                <p className="text-sm text-muted-foreground">
                                  Uploaded on{" "}
                                  {new Date(
                                    referral.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                              <Download size={16} />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "timeline" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Action History
                    </h3>
                    {referral.actionHistory &&
                    referral.actionHistory.length > 0 ? (
                      <div className="space-y-4">
                        {referral.actionHistory.map((action, index) => (
                          <div
                            key={index}
                            className="flex gap-4 relative pb-4"
                          >
                            {/* Timeline Line */}
                            {index !== referral.actionHistory!.length - 1 && (
                              <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border"></div>
                            )}

                            {/* Icon */}
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 relative z-10">
                              <Clock size={18} className="text-primary" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-muted/30 rounded-xl p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold capitalize">
                                  {action.action.replace("_", " ")}
                                </h4>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(
                                    action.actionAt
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Action performed by user ID: {action.actionBy}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <History size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No timeline events yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "notes" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      Referral Notes
                    </h3>
                    {referral.notes ? (
                      <div className="bg-muted/30 rounded-xl p-4">
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
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
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          {/* ATS Scan Result */}



          {/* Right Column - Actions & Quick Stats */}
          <div className="space-y-6">
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
      const ats = calculateATSScore(referral.aiEvaluation);
 const matchedSkills = referral.aiEvaluation?.matched_keywords ?? [];
const missingSkills = referral.aiEvaluation?.missing_keywords ?? [];



      return (
        <div className="space-y-4">
          {/* Overall ATS */}
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
                className={`h-full ${
                  ats >= 80
                    ? "bg-green-500"
                    : ats >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Keyword Match</span>
              <span>{referral.aiEvaluation.keyword_score ?? "—"}%</span>
            </div>

            <div className="flex justify-between">
              <span>Skills Match</span>
              <span>{referral.aiEvaluation.skills_score ?? "—"}%</span>
            </div>

            <div className="flex justify-between">
              <span>Experience Match</span>
              <span>{referral.aiEvaluation.exp_score ?? "—"}%</span>
            </div>

            <div className="flex justify-between">
              <span>Title Similarity</span>
              <span>{referral.aiEvaluation.title_similarity ?? "—"}%</span>
            </div>
          </div>

          {/* Keyword Insights */}
         {/* Keyword Insights */}
<div className="pt-3 border-t space-y-4">
  {/* Matched Skills */}
  <div>
    <p className="text-sm text-muted-foreground mb-2">
      Matched Skills
    </p>

    {matchedSkills.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {matchedSkills.map((skill, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full text-xs font-medium
                       bg-green-100 text-green-700 border border-green-200"
          >
            {skill}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-xs text-muted-foreground">None</p>
    )}
  </div>

  {/* Missing Skills */}
  <div>
    <p className="text-sm text-muted-foreground mb-2">
      Missing Skills
    </p>

    {missingSkills.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {missingSkills.map((skill, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full text-xs font-medium
                       bg-red-100 text-red-700 border border-red-200"
          >
            {skill}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-xs text-muted-foreground">None 🎉</p>
    )}
  </div>
</div>


          {/* Meta */}
          {referral.aiEvaluation.evaluatedAt && (
            <p className="text-xs text-muted-foreground pt-2">
              Last scanned on{" "}
              {new Date(
                referral.aiEvaluation.evaluatedAt
              ).toLocaleDateString()}
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
                <button className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium">
                  <MessageSquare size={18} />
                  Schedule Interview
                </button>
                <button className="w-full px-4 py-3 border rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-2 font-medium">
                  <Mail size={18} />
                  Send Email
                </button>
                <button className="w-full px-4 py-3 border rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-2 font-medium">
                  <Star size={18} />
                  Add to Favorites
                </button>
                <button className="w-full px-4 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-medium">
                  <Trash2 size={18} />
                  Reject Candidate
                </button>
              </div>
            </motion.div>

            {/* Status Update */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Update Status</h3>
              <div className="space-y-2">
                {(Object.entries(statusConfig) as Array<[ReferralStatus, typeof statusConfig[ReferralStatus]]>).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      className={`w-full px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                        referral.status === key
                          ? config.bg + " border"
                          : "border hover:bg-muted"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          referral.status === key
                            ? config.color
                            : "text-muted-foreground"
                        }
                      />
                      <span
                        className={`font-medium ${
                          referral.status === key
                            ? config.color
                            : "text-foreground"
                        }`}
                      >
                        {config.label}
                      </span>
                      {referral.status === key && (
                        <CheckCircle2
                          size={16}
                          className={`ml-auto ${config.color}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
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
                    className={`font-medium ${
                      referral.deleted ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {referral.deleted ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};