import { useParams, useNavigate } from "react-router-dom";
import { useGetJobByIdQuery } from "@/store/api/jobApi";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Award,
  Clock,
  Edit2,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ViewJobDetails() {
 const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
 const { data: job, isLoading, isError } =
  useGetJobByIdQuery(jobId!, {
    skip: !jobId,
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Job not found
          </p>
          <button
            onClick={() => navigate("/jobs/manage")}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "draft":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      case "closed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
      return `₹${(num / 1000).toFixed(0)}K`;
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/jobs/manage")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </button>
        <button
          onClick={() =>   navigate(`/jobs/edit/${jobId}`)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Edit2 className="h-4 w-4" />
          Edit Job
        </button>
      </div>

      {/* Job Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-6 rounded-lg border shadow-sm"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {job.department}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {job.jobType}
              </span>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
              job.status
            )}`}
          >
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Experience Level</p>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <p className="font-medium">{job.experienceLevel}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Salary Range</p>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="font-medium">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Openings</p>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <p className="font-medium">{job.openings} position(s)</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Deadline</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <p className="font-medium">
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "No deadline"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Job Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card p-6 rounded-lg border shadow-sm"
      >
        <h2 className="text-xl font-semibold mb-4">Job Description</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
      </motion.div>

      {/* Responsibilities */}
      {job.responsibilities && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-lg border shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-4">Key Responsibilities</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {job.responsibilities}
            </p>
          </div>
        </motion.div>
      )}

      {/* Requirements */}
      {job.requirements && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card p-6 rounded-lg border shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {job.requirements}
            </p>
          </div>
        </motion.div>
      )}

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card p-6 rounded-lg border shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Benefits */}
      {job.benefits && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card p-6 rounded-lg border shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-4">Benefits</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {job.benefits}
            </p>
          </div>
        </motion.div>
      )}

      {/* JD PDF */}
      {job.jdPdf && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card p-6 rounded-lg border shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-4">Job Description Document</h2>
          <a
            href={job.jdPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
         >
            <FileText className="h-4 w-4" />
            View JD PDF
          </a>
        </motion.div>
      )}
    </div>
  );
}