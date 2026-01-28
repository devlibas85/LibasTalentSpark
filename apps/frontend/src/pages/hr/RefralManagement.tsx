import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  DollarSign,
  Calendar,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface Referral {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  position: string;
  referredBy: string;
  referrerEmail: string;
  department: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "hired";
  submittedDate: string;
  reward: string;
  experience: string;
  notes: string;
}

export default function ReferralsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Sample data
  const referrals: Referral[] = [
    {
      id: "1",
      candidateName: "Arjun Malhotra",
      candidateEmail: "arjun.m@email.com",
      candidatePhone: "+91 98765 43210",
      position: "Senior React Developer",
      referredBy: "Rajesh Kumar",
      referrerEmail: "rajesh.kumar@libas.in",
      department: "Engineering",
      status: "pending",
      submittedDate: "2026-01-27",
      reward: "₹50,000",
      experience: "5 years",
      notes: "Strong frontend skills, worked at top startups",
    },
    {
      id: "2",
      candidateName: "Pooja Desai",
      candidateEmail: "pooja.d@email.com",
      candidatePhone: "+91 98765 43211",
      position: "Product Designer",
      referredBy: "Sneha Sharma",
      referrerEmail: "sneha.sharma@libas.in",
      department: "Design",
      status: "under_review",
      submittedDate: "2026-01-26",
      reward: "₹40,000",
      experience: "4 years",
      notes: "Excellent design portfolio, UI/UX specialist",
    },
    {
      id: "3",
      candidateName: "Karan Singh",
      candidateEmail: "karan.s@email.com",
      candidatePhone: "+91 98765 43212",
      position: "Backend Developer",
      referredBy: "Amit Patel",
      referrerEmail: "amit.patel@libas.in",
      department: "Engineering",
      status: "approved",
      submittedDate: "2026-01-24",
      reward: "₹50,000",
      experience: "6 years",
      notes: "Microservices expert, worked on large scale systems",
    },
    {
      id: "4",
      candidateName: "Neha Gupta",
      candidateEmail: "neha.g@email.com",
      candidatePhone: "+91 98765 43213",
      position: "QA Engineer",
      referredBy: "Priya Reddy",
      referrerEmail: "priya.reddy@libas.in",
      department: "Engineering",
      status: "rejected",
      submittedDate: "2026-01-23",
      reward: "₹30,000",
      experience: "2 years",
      notes: "Experience not matching requirements",
    },
    {
      id: "5",
      candidateName: "Rohit Verma",
      candidateEmail: "rohit.v@email.com",
      candidatePhone: "+91 98765 43214",
      position: "Marketing Manager",
      referredBy: "Vikram Singh",
      referrerEmail: "vikram.singh@libas.in",
      department: "Marketing",
      status: "hired",
      submittedDate: "2026-01-15",
      reward: "₹75,000",
      experience: "8 years",
      notes: "Successfully hired, excellent cultural fit",
    },
  ];

  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      referral.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.referredBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || referral.status === filterStatus;
    const matchesDepartment =
      filterDepartment === "all" || referral.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
          icon: Clock,
        };
      case "under_review":
        return {
          color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
          icon: Eye,
        };
      case "approved":
        return {
          color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
          icon: CheckCircle,
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
          icon: XCircle,
        };
      case "hired":
        return {
          color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
          icon: Award,
        };
      default:
        return {
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
      label: "Pending Review",
      value: referrals.filter((r) => r.status === "pending").length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Approved",
      value: referrals.filter((r) => r.status === "approved").length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Hired",
      value: referrals.filter((r) => r.status === "hired").length,
      icon: Award,
      color: "text-emerald-600",
    },
  ];

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
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
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
                  Reward
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
                const StatusIcon = getStatusConfig(referral.status).icon;
                return (
                  <motion.tr
                    key={referral.id}
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
                        <p className="text-sm font-medium">{referral.position}</p>
                        <p className="text-xs text-muted-foreground">
                          {referral.department}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium">
                          {referral.referredBy}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {referral.referrerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          getStatusConfig(referral.status).color
                        }`}
                      >
                        <StatusIcon size={12} />
                        {referral.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <DollarSign size={14} className="text-green-600" />
                        {referral.reward}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm flex items-center gap-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        {new Date(referral.submittedDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {referral.status === "pending" && (
                          <>
                            <button
                              className="p-1.5 hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <ThumbsUp size={16} />
                            </button>
                            <button
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            setShowDetails(
                              showDetails === referral.id ? null : referral.id
                            )
                          }
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          title="Message"
                        >
                          <MessageSquare size={16} />
                        </button>
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
            className="bg-card border rounded-xl p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const referral = referrals.find((r) => r.id === showDetails);
              if (!referral) return null;

              return (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {referral.candidateName}
                      </h2>
                      <p className="text-muted-foreground">{referral.position}</p>
                    </div>
                    <button
                      onClick={() => setShowDetails(null)}
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="text-sm font-medium">
                        {referral.candidateEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Phone</p>
                      <p className="text-sm font-medium">
                        {referral.candidatePhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Experience
                      </p>
                      <p className="text-sm font-medium">{referral.experience}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Department
                      </p>
                      <p className="text-sm font-medium">{referral.department}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Referred By
                    </p>
                    <p className="text-sm font-medium">{referral.referredBy}</p>
                    <p className="text-sm text-muted-foreground">
                      {referral.referrerEmail}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{referral.notes}</p>
                  </div>

                  {referral.status === "pending" && (
                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Approve Referral
                      </button>
                      <button className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Reject Referral
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}