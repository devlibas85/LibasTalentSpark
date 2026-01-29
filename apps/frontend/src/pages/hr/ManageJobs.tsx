import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useGetJobsQuery } from "@/store/jobApi";
import type { Job } from "@/types/job";
import { useNavigate } from "react-router-dom";

export default function ManageJobs() {
  const { data: jobs = [], isLoading, isError } = useGetJobsQuery();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState<string | null>(null);

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
      job.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || uiStatus(job.status) === filterStatus;

    const matchesDepartment =
      filterDepartment === "all" || job.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

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
     LOADING / ERROR
     =============================== */

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (isError) {
    return <div className="p-6">Error loading jobs</div>;
  }

  return (
    <div className="p-6 space-y-6">
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
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Post New Job
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Jobs", value: jobs.length, color: "text-blue-600" },
          {
            label: "Active",
            value: jobs.filter((j) => uiStatus(j.status) === "active").length,
            color: "text-green-600",
          },
          {
            label: "Paused",
            value: jobs.filter((j) => uiStatus(j.status) === "paused").length,
            color: "text-yellow-600",
          },
          {
            label: "Closed",
            value: jobs.filter((j) => j.status === "closed").length,
            color: "text-gray-600",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="bg-card p-4 rounded-lg border"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* ================= FILTERS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Department Filter */}
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        >
          <option value="all">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Design">Design</option>
          <option value="Product">Product</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Operations">Operations</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedJobs(filteredJobs.map((j) => j._id));
                      } else {
                        setSelectedJobs([]);
                      }
                    }}
                    checked={
                      selectedJobs.length === filteredJobs.length &&
                      filteredJobs.length > 0
                    }
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left p-4 font-medium">Job Title</th>
                <th className="text-left p-4 font-medium">Department</th>
                <th className="text-left p-4 font-medium">Location</th>

                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Deadline</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => {
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

                    <td className="p-4">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.jobType}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">{job.department}</td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {job.location}
                      </div>
                    </td>

                   

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {uiStatus(job.status)}
                      </span>
                    </td>

                    <td className="p-4">
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>

                    <td className="p-4">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowMenu(showMenu === job._id ? null : job._id)
                          }
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {showMenu === job._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 mt-2 w-48 bg-popover border rounded-lg shadow-lg z-10"
                          >
                            {[
                              { icon: Eye, label: "View Details", color: "" },
                              { icon: Edit2, label: "Edit Job", color: "" },
                              {
                                icon: isActive ? PauseCircle : PlayCircle,
                                label: isActive ? "Pause Job" : "Activate Job",
                                color: "",
                              },
                              { icon: Copy, label: "Duplicate", color: "" },
                              {
                                icon: Trash2,
                                label: "Delete",
                                color:
                                  "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20",
                              },
                            ].map((item) => (
                              <button
                                key={item.label}
                                onClick={() => setShowMenu(null)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left ${item.color}`}
                              >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
            Previous
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            1
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
            2
          </button>
          <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}