import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Copy,
  PlayCircle,
  PauseCircle,
  MapPin,
  Briefcase,

  Calendar,
  Award,
} from "lucide-react";
import { useGetJobsQuery } from "@/store/api/jobApi";
import { useNavigate } from "react-router-dom";

// Job Type Interface
export type JobStatus = "draft" | "published" | "closed";

export interface Job {
  _id: string;
  title: string;
  department: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  openings: number;
  deadline?: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
  benefits: string;
  jdPdf?: string;
  createdBy: string;
  status: JobStatus;
  deleted: boolean;
  editHistory: unknown[];
  createdAt: string;
  updatedAt: string;
}

export default function ManageJobs() {
  const { data: jobs = [], isLoading, isError } = useGetJobsQuery();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterJobType, setFilterJobType] = useState("all");
  const [filterExperienceLevel, setFilterExperienceLevel] = useState("all");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  /* ===============================
     STATUS HELPERS (DB → UI)
     =============================== */

  const uiStatus = (status: Job["status"]) => {
    switch (status) {
      case "published":
        return "active";
      case "draft":
        return "paused";
      case "closed":
        return "closed";
    }
  };



  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "draft":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      case "closed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  /* ===============================
     FILTERED JOBS
     =============================== */

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || uiStatus(job.status) === filterStatus;

    const matchesDepartment =
      filterDepartment === "all" || job.department === filterDepartment;

    const matchesJobType =
      filterJobType === "all" || job.jobType === filterJobType;

    const matchesExperience =
      filterExperienceLevel === "all" ||
      job.experienceLevel === filterExperienceLevel;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDepartment &&
      matchesJobType &&
      matchesExperience
    );
  });
const totalPages = Math.max(
  1,
  Math.ceil(filteredJobs.length / ITEMS_PER_PAGE)
);

const safeCurrentPage = Math.min(currentPage, totalPages);

  /* ===============================
     PAGINATION
     =============================== */

 
 const paginatedJobs = filteredJobs.slice(
  (safeCurrentPage - 1) * ITEMS_PER_PAGE,
  safeCurrentPage * ITEMS_PER_PAGE
);


  /* ===============================
     SELECTION
     =============================== */

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  /* ===============================
     ACTIONS
     =============================== */

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
    setShowMenu(null);
  };

  const handleEditJob = (jobId: string) => {
    navigate(`/jobs/edit/${jobId}`);
    setShowMenu(null);
  };

  const handleDeleteJob = (jobId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete job:", jobId);
    setShowMenu(null);
  };

  const handleDuplicateJob = (jobId: string) => {
    // TODO: Implement duplicate functionality
    console.log("Duplicate job:", jobId);
    setShowMenu(null);
  };

  const handleToggleStatus = (jobId: string) => {
    // TODO: Implement status toggle
    console.log("Toggle status:", jobId);
    setShowMenu(null);
  };

  /* ===============================
     FORMAT SALARY
     =============================== */

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
      return `₹${(num / 1000).toFixed(0)}K`;
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  };

  /* ===============================
     LOADING / ERROR
     =============================== */

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Error loading jobs
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Manage Jobs</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all job postings
          </p>
        </div>
        <button
          onClick={() => navigate("/jobs/post")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          + Post New Job
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Jobs",
            value: jobs.length,
            color: "text-blue-600",
            icon: Briefcase,
          },
          {
            label: "Active",
            value: jobs.filter((j) => uiStatus(j.status) === "active").length,
            color: "text-green-600",
            icon: PlayCircle,
          },
          {
            label: "Paused",
            value: jobs.filter((j) => uiStatus(j.status) === "paused").length,
            color: "text-yellow-600",
            icon: PauseCircle,
          },
          {
            label: "Closed",
            value: jobs.filter((j) => j.status === "closed").length,
            color: "text-gray-600",
            icon: Calendar,
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="bg-card p-4 rounded-lg border shadow-sm"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-card p-4 rounded-lg border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, department, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Operations">Operations</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>

          {/* Job Type Filter */}
          <select
            value={filterJobType}
            onChange={(e) => setFilterJobType(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="all">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>

          {/* Experience Level Filter */}
          <select
            value={filterExperienceLevel}
            onChange={(e) => setFilterExperienceLevel(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all lg:col-span-2"
          >
            <option value="all">All Experience Levels</option>
            <option value="Entry-level">Entry-level</option>
            <option value="Mid-level">Mid-level</option>
            <option value="Senior-level">Senior-level</option>
            <option value="Lead">Lead</option>
            <option value="Executive">Executive</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery ||
            filterStatus !== "all" ||
            filterDepartment !== "all" ||
            filterJobType !== "all" ||
            filterExperienceLevel !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setFilterDepartment("all");
                setFilterJobType("all");
                setFilterExperienceLevel("all");
              }}
              className="px-4 py-2.5 border rounded-lg hover:bg-muted transition-colors lg:col-span-3"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 w-12">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedJobs(paginatedJobs.map((j) => j._id));
                      } else {
                        setSelectedJobs([]);
                      }
                    }}
                    checked={
                      selectedJobs.length === paginatedJobs.length &&
                      paginatedJobs.length > 0
                    }
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left p-3 font-medium">Job Details</th>
                <th className="text-left p-3 font-medium">Department</th>
                <th className="text-left p-3 font-medium">Location</th>
                <th className="text-left p-3 font-medium">Experience</th>
                <th className="text-left p-3 font-medium">Salary</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Deadline</th>
                <th className="text-left p-3 font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <p className="text-muted-foreground">No jobs found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your filters
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => {
                  const isActive = job.status === "published";

                  return (
                    <motion.tr
                      key={job._id}
                      className="border-t hover:bg-muted/30 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job._id)}
                          onChange={() => toggleJobSelection(job._id)}
                          className="rounded border-gray-300"
                        />
                      </td>

                      <td className="p-3">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Briefcase className="h-3 w-3" />
                            {job.jobType}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="text-sm">{job.department}</span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">{job.location}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="text-sm flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 text-muted-foreground" />
                          {job.experienceLevel}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="text-sm">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {uiStatus(job.status)}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="text-sm">
                          {job.deadline
                            ? new Date(job.deadline).toLocaleDateString(
                                "en-IN",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowMenu(
                                showMenu === job._id ? null : job._id
                              )
                            }
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          <AnimatePresence>
                            {showMenu === job._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 mt-2 w-48 bg-popover border rounded-lg shadow-lg z-10"
                                onMouseLeave={() => setShowMenu(null)}
                              >
                                <button
                                  onClick={() => handleViewJob(job._id)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left rounded-t-lg"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleEditJob(job._id)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                                >
                                  <Edit2 className="h-4 w-4" />
                                  Edit Job
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(job._id)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                                >
                                  {isActive ? (
                                    <>
                                      <PauseCircle className="h-4 w-4" />
                                      Pause Job
                                    </>
                                  ) : (
                                    <>
                                      <PlayCircle className="h-4 w-4" />
                                      Activate Job
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDuplicateJob(job._id)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                                >
                                  <Copy className="h-4 w-4" />
                                  Duplicate
                                </button>
                                <div className="border-t my-1"></div>
                                <button
                                  onClick={() => handleDeleteJob(job._id)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left text-red-600 dark:text-red-400 rounded-b-lg"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      {filteredJobs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
           Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}–
{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredJobs.length)} of{" "}
{filteredJobs.length} jobs

          </p>

          <div className="flex gap-2">
           <button
  disabled={safeCurrentPage === 1}
  onClick={() => setCurrentPage((p) => p - 1)}
>
  Previous
</button>


            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                  safeCurrentPage === pageNum

                      ? "bg-primary text-primary-foreground"
                      : "border hover:bg-muted"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

           <button
  disabled={safeCurrentPage === totalPages}
  onClick={() => setCurrentPage((p) => p + 1)}
>
  Next
</button>

          </div>
        </div>
      )}
    </div>
  );
}