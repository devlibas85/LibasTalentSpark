import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetAllReferralsQuery,
  useUpdateReferralMutation,
} from "@/store/api/refralApi";
import type {
  AIEvaluation,
  Referral,
  ReferralStatus,
} from "@/store/api/refralApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Search,
  Filter,
  Mail,
  MapPin,
  Briefcase,
  Star,
  MoreVertical,
  ChevronRight,
  Clock,
  Calendar,
  ThumbsDown,
  ThumbsUp,
  Eye,
  AlertTriangle,
  X,
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  experience: string;
  stage: "applied" | "screening" | "interview" | "rejected" | "hired";
  appliedDate: string;
  rating: number;
  avatar: string;
  salary: string;
  skills: string[];
  atsScore: number | null;
  aiEvaluation?: Referral["aiEvaluation"];
  resume: string;
}

const stages = [
  { id: "applied", label: "Applied", color: "bg-blue-500" },
  { id: "screening", label: "Screening", color: "bg-yellow-500" },
  { id: "interview", label: "Interview", color: "bg-purple-500" },
  { id: "rejected", label: "Rejected", color: "bg-red-500" },
  { id: "hired", label: "Hired", color: "bg-emerald-500" },
];

const getStageFromStatus = (status: ReferralStatus): Candidate["stage"] => {
  const statusMap: Record<ReferralStatus, Candidate["stage"]> = {
    submitted: "applied",
    under_review: "screening",
    interview_scheduled: "interview",
    rejected: "rejected",
    hired: "hired",
  };
  return statusMap[status] || "applied";
};

const calculateAtsScore = (ai?: AIEvaluation) => {
  if (!ai?.summary?.score) {
    return null;
  }
  return Math.round(ai.summary.score);
};

export default function CandidatePipeline() {
  const {
    data: referrals = [],
    isLoading,
    isError,
    refetch,
  } = useGetAllReferralsQuery();
  const [updateReferral] = useUpdateReferralMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  const [rejectConfirm, setRejectConfirm] = useState<string | null>(null);

  const navigate = useNavigate();
  const handleViewCandidate = async (candidateId: string) => {
    const referral = referrals.find((r) => r._id === candidateId);

    if (referral?.status === "submitted") {
      try {
        await updateReferral({
          id: candidateId,
          data: { action: "reviewed", remarks: "Viewed by HR" },
        }).unwrap();

        refetch();
      } catch (error) {
        console.log("Auto review update failed", error);
      }
    }

    navigate(`/candidates/${candidateId}`);
  };
  const candidates: Candidate[] = referrals.map((r: Referral) => {
    const initials = r.candidateName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
      id: r._id,
      name: r.candidateName,
      email: r.candidateEmail,
      phone: r.candidatePhone,
      position: r.job?.title || "—",
      location: r.job?.location || "Remote",
      experience: r.aiEvaluation?.experience?.candidate_years
        ? `${r.aiEvaluation.experience.candidate_years} yrs`
        : "Not specified",
      salary: "—",
      skills: r.aiEvaluation?.skills?.matched || [],
      stage: getStageFromStatus(r.status),
      appliedDate: r.createdAt,
      rating: 4.5,
      avatar: initials,
      atsScore: calculateAtsScore(r.aiEvaluation),
      aiEvaluation: r.aiEvaluation,
      resume: r.resume,
    };
  });

  const uniqueJobs = Array.from(
    new Set(candidates.map((c) => c.position).filter((p) => p !== "—")),
  );

  const getAtsMeta = (ai?: AIEvaluation) => {
    const score = ai?.summary?.score;
    if (score === undefined || score === null) {
      return { label: "Pending", color: "bg-gray-400" };
    }
    if (score >= 85)
      return { label: `${score}% - Excellent Match`, color: "bg-green-600" };
    else if (score >= 70)
      return { label: `${score}% - Strong Match`, color: "bg-green-500" };
    else if (score >= 60)
      return { label: `${score}% - Good Match`, color: "bg-green-400" };
    else if (score >= 50)
      return { label: `${score}% - Moderate Match`, color: "bg-yellow-500" };
    else if (score >= 40)
      return { label: `${score}% - Weak Match`, color: "bg-red-400" };
    else return { label: `${score}% - Poor Match`, color: "bg-red-600" };
  };

  const getAiVerdictMeta = (ai?: AIEvaluation) => {
    const score = ai?.summary?.score;
    const verdict = ai?.summary?.verdict;
    if (score === undefined || score === null || !verdict) {
      return { text: "Pending", badgeClass: "bg-gray-100 text-gray-500" };
    }
    if (score >= 70)
      return {
        text: `${score}% · ${verdict}`,
        badgeClass: "bg-green-100 text-green-700",
      };
    else if (score >= 50)
      return {
        text: `${score}% · ${verdict}`,
        badgeClass: "bg-yellow-100 text-yellow-700",
      };
    else
      return {
        text: `${score}% · ${verdict}`,
        badgeClass: "bg-red-100 text-red-700",
      };
  };

  const handleStatusUpdate = async (candidateId: string, action: string) => {
    try {
      await updateReferral({ id: candidateId, data: { action } }).unwrap();
      toast.success("Status updated");
      refetch();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage =
      selectedStage === "all" || candidate.stage === selectedStage;
    const matchesJob =
      selectedJob === "all" || candidate.position === selectedJob;
    return matchesSearch && matchesStage && matchesJob;
  });

  const getCandidatesByStage = (stageId: string) => {
    return filteredCandidates.filter((c) => c.stage === stageId);
  };

  const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleViewCandidate(candidate.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">
              {candidate.avatar}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-foreground">{candidate.name}</h3>
            <p className="text-xs text-muted-foreground">
              {candidate.position}
            </p>
          </div>
        </div>
        <button className="p-1 hover:bg-muted rounded">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin size={14} />
          <span>{candidate.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Briefcase size={14} />
          <span>{candidate.experience}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock size={14} />
          <span>
            Applied {new Date(candidate.appliedDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* ATS Score */}
      {candidate.aiEvaluation ? (
        candidate.atsScore !== null ? (
          (() => {
            const { label, color } = getAtsMeta(candidate.aiEvaluation);
            return (
              <>
                <div className="flex items-center justify-between text-xs mb-1 mt-3">
                  <span className="text-muted-foreground">ATS Score</span>
                  <span className="font-medium">{label}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${candidate.atsScore}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full ${color}`}
                  />
                </div>
              </>
            );
          })()
        ) : (
          <p className="text-xs text-muted-foreground mt-2">
            AI evaluation incomplete
          </p>
        )
      ) : (
        <p className="text-xs text-muted-foreground mt-2">
          AI evaluation pending…
        </p>
      )}

      {/* Skills */}
      {candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {candidate.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium">{candidate.rating}</span>
        </div>

        {/* Buttons — stopPropagation so card click doesn't fire */}
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Eye — view profile */}
          <button
            onClick={() => handleViewCandidate(candidate.id)}
            className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
            title="View profile"
          >
            <Eye size={16} />
          </button>

          {/* Mail — email candidate */}
          <a
            href={`mailto:${candidate.email}`}
            className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
            title="Email candidate"
          >
            <Mail size={16} />
          </a>

          {/* Stage action buttons */}
          {(candidate.stage === "applied" ||
            candidate.stage === "screening") && (
            <>
              <button
                onClick={() =>
                  handleStatusUpdate(candidate.id, "interview_scheduled")
                }
                className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-600 rounded transition-colors"
                title="Schedule Interview"
              >
                <Calendar size={16} />
              </button>
              <button
                onClick={() => setRejectConfirm(candidate.id)}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded transition-colors"
                title="Reject"
              >
                <ThumbsDown size={16} />
              </button>
            </>
          )}
          {candidate.stage === "interview" && (
            <>
              <button
                onClick={() => handleStatusUpdate(candidate.id, "hired")}
                className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 rounded transition-colors"
                title="Mark Hired"
              >
                <ThumbsUp size={16} />
              </button>
              <button
                onClick={() => setRejectConfirm(candidate.id)}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded transition-colors"
                title="Reject"
              >
                <ThumbsDown size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading candidate pipeline...
      </div>
    );
  }
  if (isError) {
    return <div className="p-6 text-red-500">Failed to load candidates</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Candidate Pipeline
        </h1>
        <p className="text-muted-foreground mt-1">
          Track and manage candidates through the hiring process
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const count = candidates.filter((c) => c.stage === stage.id).length;
          return (
            <div key={stage.id} className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <p className="text-sm text-muted-foreground">{stage.label}</p>
              </div>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="relative md:w-44">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
            >
              <option value="all">All Stages</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
          <div className="relative md:w-52">
            <Briefcase
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
            >
              <option value="all">All Jobs</option>
              {uniqueJobs.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("board")}
              className={`px-4 py-2.5 rounded-lg transition-colors ${viewMode === "board" ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      {viewMode === "board" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage.id);
            return (
              <div key={stage.id} className="shrink-0 w-80">
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold">{stage.label}</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-card rounded-full text-sm font-medium">
                      {stageCandidates.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {stageCandidates.length > 0 ? (
                      stageCandidates.map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No candidates in this stage
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Stage
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Experience
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    AI Score
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Applied
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCandidates.map((candidate) => {
                  const aiMeta = getAiVerdictMeta(candidate.aiEvaluation);
                  return (
                    <tr
                      key={candidate.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {candidate.avatar}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {candidate.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {candidate.position}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                          {candidate.stage}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {candidate.experience}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${aiMeta.badgeClass}`}
                        >
                          {aiMeta.text}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {new Date(candidate.appliedDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleViewCandidate(candidate.id)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                    Reject Candidate?
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
    </div>
  );
}
