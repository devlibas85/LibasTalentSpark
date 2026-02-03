/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
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
} from "lucide-react";
import { useGetAllReferralsQuery, useUpdateReferralMutation, type Referral } from "../../store/api/refralApi";
import { toast } from "sonner";

export default function ReferralsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [actionRemarks, setActionRemarks] = useState<string>("");

  // Fetch referrals from API
  const { data: referrals = [], isLoading, refetch } = useGetAllReferralsQuery();
  const [updateReferral] = useUpdateReferralMutation();

  // Handle view referral (marks as under_review)
  const handleViewReferral = async (referralId: string) => {
    try {
      if (showDetails === referralId) {
        setShowDetails(null);
        return;
      }

      // Find referral to check current status
      const referral = referrals.find(r => r._id === referralId);
      
      // Only update if status is submitted
      if (referral?.status === "submitted") {
        await updateReferral({
          id: referralId,
          data: {
            action: "reviewed",
            remarks: "Viewed by HR",
          },
        }).unwrap();
        toast.success("Referral marked under review");
      }

      setShowDetails(referralId);
    } catch (error) {
      toast.error("Failed to mark referral under review");
    }
  };

  // Handle status update
  const handleStatusUpdate = async (referralId: string, action: string, remarks?: string) => {
    try {
      await updateReferral({
        id: referralId,
        data: {
          action,
          remarks: remarks || actionRemarks,
        },
      }).unwrap();
      toast.success("Referral updated");
      
      // Clear remarks
      setActionRemarks("");
      
      // Close modal
      setShowDetails(null);
      
      // Refetch data
      refetch();
    } catch (error) {
      toast.error("Failed to update referral status");
    }
  };

  // Filter referrals
  const filteredReferrals:Referral[] = referrals.filter((referral) => {
    const matchesSearch =
      referral.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.referredBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || referral.status === filterStatus;
    
    // If you have department in job, filter by it
    const job = referral.job as any;
    const matchesDepartment =
      filterDepartment === "all" || (job.department && job.department === filterDepartment);
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "submitted":
        return {
          label: "Submitted",
          color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
          icon: Clock,
        };
      case "under_review":
        return {
          label: "Under Review",
          color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
          icon: Eye,
        };
      case "interview_scheduled":
        return {
          label: "Interview Scheduled",
          color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
          icon: Calendar,
        };
      case "rejected":
        return {
          label: "Rejected",
          color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
          icon: XCircle,
        };
      case "hired":
        return {
          label: "Hired",
          color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
          icon: Award,
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          icon: Clock,
        };
    }
  };

  const stats = [
    {
      label: "Total Referrals",
      value: referrals.length,
      icon: UserPlus,
      color: "text-blue-600",
    },
    {
      label: "Submitted",
      value: referrals.filter((r) => r.status === "submitted").length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Under Review",
      value: referrals.filter((r) => r.status === "under_review").length,
      icon: Eye,
      color: "text-blue-600",
    },
    {
      label: "Hired",
      value: referrals.filter((r) => r.status === "hired").length,
      icon: Award,
      color: "text-emerald-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Referrals Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and manage employee referrals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search referrals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
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
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
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
                  Referred By
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReferrals.map((referral) => {
                const statusConfig = getStatusConfig(referral.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <motion.tr
                    key={referral._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {referral.candidateName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {referral.candidateEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium">{referral.job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {(referral.job as any).location}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium">
                          {referral.referredBy.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {referral.referredBy.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                      >
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm flex items-center gap-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewReferral(referral._id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            referral.status === "submitted" 
                              ? "hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600"
                              : "hover:bg-muted"
                          }`}
                          title={referral.status === "submitted" ? "View & Start Review" : "View Details"}
                        >
                          <Eye size={16} />
                        </button>
                        
                        {referral.status === "submitted" || referral.status === "under_review" ? (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(referral._id, "interview_scheduled")}
                              className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-600 rounded-lg transition-colors"
                              title="Schedule Interview"
                            >
                              <Calendar size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(referral._id, "rejected")}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </>
                        ) : referral.status === "interview_scheduled" ? (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(referral._id, "hired")}
                              className="p-1.5 hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 rounded-lg transition-colors"
                              title="Mark as Hired"
                            >
                              <ThumbsUp size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(referral._id, "rejected")}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </>
                        ) : null}
                        
                        <a
                          href={`mailto:${referral.candidateEmail}`}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Email Candidate"
                        >
                          <Mail size={16} />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredReferrals.length} of {referrals.length} referrals
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border rounded-lg hover:bg-muted text-sm transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-1.5 border rounded-lg hover:bg-muted text-sm transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border rounded-lg hover:bg-muted text-sm transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const referral = referrals.find((r) => r._id === showDetails);
              if (!referral) return null;

              const job = referral.job as any;
              const aiEvaluation = referral.aiEvaluation;
              const statusConfig = getStatusConfig(referral.status);

              return (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {referral.candidateName}
                      </h2>
                      <p className="text-muted-foreground">{job.title}</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-2 ${statusConfig.color}`}>
                        <statusConfig.icon size={12} />
                        {statusConfig.label}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowDetails(null)}
                      className="p-2 hover:bg-muted rounded-lg text-xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Candidate Details */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Candidate Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Email</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{referral.candidateEmail}</p>
                            <a href={`mailto:${referral.candidateEmail}`} className="text-primary hover:underline">
                              <Mail size={14} />
                            </a>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Phone</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{referral.candidatePhone}</p>
                            <a href={`tel:${referral.candidatePhone}`} className="text-primary hover:underline">
                              <Phone size={14} />
                            </a>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Relationship</p>
                          <p className="text-sm font-medium capitalize">{referral.relationship}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Resume</p>
                          <a 
                            href={referral.resume} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                          >
                            <FileText size={14} />
                            View Resume
                          </a>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Notes</p>
                        <p className="text-sm bg-muted p-3 rounded-lg">{referral.notes || "No notes provided"}</p>
                      </div>
                    </div>

                    {/* Job & Referrer Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-lg mb-2">Job Details</h3>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-muted-foreground">{job.location}</p>
                          {job.department && (
                            <p className="text-sm text-muted-foreground">{job.department}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-lg mb-2">Referred By</h3>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="font-medium">{referral.referredBy.name}</p>
                          <p className="text-sm text-muted-foreground">{referral.referredBy.email}</p>
                        </div>
                      </div>

                      {/* AI Evaluation */}
                      {aiEvaluation && (
                        <div>
                          <h3 className="font-medium text-lg mb-2">AI Evaluation</h3>
                          <div className="bg-muted p-3 rounded-lg space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Match Score</p>
                                <p className="font-medium">{aiEvaluation.keyword_score || 0}/100</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Experience Match</p>
                                <p className="font-medium">{aiEvaluation.exp_score || 0}%</p>
                              </div>
                            </div>
                            {aiEvaluation.matched_keywords && aiEvaluation.matched_keywords.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Matched Keywords</p>
                                <div className="flex flex-wrap gap-1">
                                  {aiEvaluation.matched_keywords.map((keyword, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action History */}
                  {referral.actionHistory && referral.actionHistory.length > 0 && (
                    <div>
                      <h3 className="font-medium text-lg mb-2">Action History</h3>
                      <div className="space-y-2">
                        {referral.actionHistory.map((action, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm border-b pb-2">
                            <span className="capitalize">{action.action}</span>
                            <span className="text-muted-foreground">
                              {new Date(action.actionAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t pt-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Remarks
                        </label>
                        <textarea
                          value={actionRemarks}
                          onChange={(e) => setActionRemarks(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          placeholder="Add remarks for this action..."
                        />
                      </div>

                      <div className="flex gap-3">
                        {referral.status === "submitted" || referral.status === "under_review" ? (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(referral._id, "interview_scheduled")}
                              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Schedule Interview
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(referral._id, "rejected")}
                              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : referral.status === "interview_scheduled" ? (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(referral._id, "hired")}
                              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              Mark as Hired
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(referral._id, "rejected")}
                              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject After Interview
                            </button>
                          </>
                        ) : null}
                        
                        <button
                          onClick={() => setShowDetails(null)}
                          className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-muted transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}