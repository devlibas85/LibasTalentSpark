/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useGetJobsQuery } from "@/store/jobApi";

// You'll need to create this for referrals only
import { 
  useGetMyReferralsQuery,
  useSubmitReferralMutation 
} from "@/store/refralApi";

export default function EmployeeDashboard() {
  // Reuse existing jobs query - filter for published jobs only
  const { data: allJobs = [], isLoading: jobsLoading, isError: jobsError } = useGetJobsQuery();
  
  // Filter for only published/active jobs for employee referral
  const openJobs = allJobs.filter(job => job.status === "published");
  
  // Fetch user's referrals
const {
  data: myReferrals = [],
  isLoading: referralsLoading,
  isError: referralsError,
} = useGetMyReferralsQuery(undefined, {
   
});
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
  const stats = {
    openPositions: openJobs.length,
    myReferrals: myReferrals.length,
    pendingReview: myReferrals.filter((r: any) => r.status === "Under Review" || r.status === "Pending").length,
    successfulHires: myReferrals.filter((r: any) => r.status === "Hired").length,
  };

const handleReferralSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  await submitReferral({
    candidateName: referralData.candidateName,
    candidateEmail: referralData.candidateEmail,
    candidatePhone: referralData.candidatePhone,
    relationship: referralData.relationship,
    notes: referralData.notes,
    jobId: selectedJob || "",
    resumeFile: referralData.resumeFile,
  });
};


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
        return "text-blue-600";
      case "under review":
      case "pending":
        return "text-yellow-600";
      case "hired":
      case "accepted":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Loading state
  if (jobsLoading || referralsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (jobsError || referralsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Error loading dashboard
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          View open positions and refer talented candidates you know
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Open Positions", value: stats.openPositions },
          { label: "My Referrals", value: stats.myReferrals },
          { label: "Pending Review", value: stats.pendingReview },
          { label: "Successful Hires", value: stats.successfulHires },
        ].map((item) => (
          <div key={item.label} className="bg-card border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-2xl font-bold mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* My Referrals */}
      <div className="bg-card border rounded-xl p-4">
        <h2 className="font-semibold mb-4">My Referrals</h2>
        <div className="overflow-x-auto">
          {myReferrals.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No referrals yet. Start referring candidates below!
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2 font-medium">Candidate Name</th>
                  <th className="pb-2 font-medium">Position</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {myReferrals.map((referral: any) => (
                  <tr key={referral._id} className="border-b last:border-0">
                    <td className="py-3">{referral.candidateName}</td>
                    <td className="py-3">{referral.jobTitle || referral.job?.title}</td>
                    <td className="py-3">
                      <span className={`font-medium ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(referral.createdAt || referral.submittedDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-card border rounded-xl p-4">
        <h2 className="font-semibold mb-4">Open Positions</h2>
        {openJobs.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No open positions available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openJobs.map((job) => (
              <div
                key={job._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.department}
                    </p>
                  </div>
                  {/* You can add referral bonus field to your Job type if needed */}
                  <span className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">
                    Bonus
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {job.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span>📍 {job.location}</span>
                  <span>⏰ {job.jobType}</span>
                  <span>💰 {formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>
                <button
                  onClick={() => openReferralForm(job._id)}
                  className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Refer a Candidate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referral Form Modal */}
      {showReferralForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Submit Referral</h2>
              <button
                onClick={() => setShowReferralForm(false)}
                className="text-2xl text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleReferralSubmit} className="space-y-4">
              {/* Candidate Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  placeholder="Enter full name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Candidate Email */}
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  placeholder="candidate@example.com"
                  disabled={isSubmitting}
                />
              </div>

              {/* Candidate Phone */}
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  placeholder="+91 XXXXX XXXXX"
                  disabled={isSubmitting}
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  disabled={isSubmitting}
                >
                  <option value="">Select relationship</option>
                  <option value="friend">Friend</option>
                  <option value="former_colleague">Former Colleague</option>
                  <option value="family">Family Member</option>
                  <option value="acquaintance">Acquaintance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Resume/CV *
                </label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="w-full px-3 py-2 border rounded-lg bg-background file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-sm"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, or DOCX (Max 5MB)
                </p>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  rows={4}
                  placeholder="Why do you think this candidate would be a good fit?"
                  disabled={isSubmitting}
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReferralForm(false)}
                  className="flex-1 px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Referral"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}