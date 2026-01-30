import { useState } from "react";
import { motion } from "framer-motion";
import { useGetAllReferralsQuery } from "@/store/refralApi";
import type { Referral, ReferralStatus } from "@/store/refralApi";

import {
  Search,
  Filter,
  Mail,
  MapPin,
  Briefcase,
  Star,
  MessageSquare,
  FileText,
  MoreVertical,
  ChevronRight,
  Clock,
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  location: string;
  experience: string;
  stage: "applied" | "screening" | "interview" | "offer" | "hired";
  appliedDate: string;
  rating: number;
  avatar: string;
  salary: string;
  skills: string[];
}

const stages = [
  { id: "applied", label: "Applied", color: "bg-blue-500" },
  { id: "screening", label: "Screening", color: "bg-yellow-500" },
  { id: "interview", label: "Interview", color: "bg-purple-500" },
  { id: "offer", label: "Offer", color: "bg-green-500" },
  { id: "hired", label: "Hired", color: "bg-emerald-500" },
];

// Helper function to map referral status to stage
const getStageFromStatus = (status: ReferralStatus): Candidate["stage"] => {
  const statusMap: Record<ReferralStatus, Candidate["stage"]> = {
    submitted: "applied",
    under_review: "screening",
    interview_scheduled: "interview",
    rejected: "applied", // You might want to handle this differently
    hired: "hired",
  };
  return statusMap[status] || "applied";
};

export default function CandidatePipeline() {
  const {
    data: referrals = [],
    isLoading,
    isError,
  } = useGetAllReferralsQuery();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  // Safe mapping with fallbacks
  const candidates: Candidate[] = referrals.map((r: Referral) => {
    // Get initials for avatar
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
      location: r.job?.location || "Remote", // Provide a default
      experience: "Not specified", // Not in backend schema yet
      salary: "—",
      skills: [], // Not in backend schema yet
      stage: getStageFromStatus(r.status),
      appliedDate: r.createdAt,
      rating: 4.5, // Placeholder - consider adding to backend
      avatar: initials,
    };
  });

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage =
      selectedStage === "all" || candidate.stage === selectedStage;
    return matchesSearch && matchesStage;
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
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary">
              {candidate.avatar}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-foreground">{candidate.name}</h3>
            <p className="text-xs text-muted-foreground">{candidate.position}</p>
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
          <span>Applied {new Date(candidate.appliedDate).toLocaleDateString()}</span>
        </div>
      </div>

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
        <div className="flex gap-1">
          <button className="p-1.5 hover:bg-muted rounded transition-colors">
            <MessageSquare size={16} />
          </button>
          <button className="p-1.5 hover:bg-muted rounded transition-colors">
            <FileText size={16} />
          </button>
          <button className="p-1.5 hover:bg-muted rounded transition-colors">
            <Mail size={16} />
          </button>
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
    return (
      <div className="p-6 text-red-500">
        Failed to load candidates
      </div>
    );
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
          {/* Search */}
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

          {/* Stage Filter */}
          <div className="relative md:w-48">
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

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("board")}
              className={`px-4 py-2.5 rounded-lg transition-colors ${
                viewMode === "board"
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-muted"
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-muted"
              }`}
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
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div className="bg-muted/30 rounded-xl p-4">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold">{stage.label}</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-card rounded-full text-sm font-medium">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Candidates */}
                  <div className="space-y-3">
                    {stageCandidates.length > 0 ? (
                      stageCandidates.map((candidate) => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
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
                    Rating
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
                {filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
                    <td className="px-4 py-4 text-sm">{candidate.position}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                        {candidate.stage}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">{candidate.experience}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        <span className="text-sm font-medium">
                          {candidate.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {new Date(candidate.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}