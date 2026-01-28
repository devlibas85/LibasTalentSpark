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
  Users,
  MapPin,
  Clock,
  Calendar,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: "active" | "paused" | "closed";
  applications: number;
  posted: string;
  deadline: string;
  salary: string;
}

export default function ManageJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Sample data
  const jobs: Job[] = [
    {
      id: "1",
      title: "Senior React Developer",
      department: "Engineering",
      location: "Bangalore, India",
      type: "Full-time",
      status: "active",
      applications: 24,
      posted: "2026-01-15",
      deadline: "2026-02-15",
      salary: "₹12-18 LPA",
    },
    {
      id: "2",
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      status: "active",
      applications: 18,
      posted: "2026-01-20",
      deadline: "2026-02-20",
      salary: "₹10-15 LPA",
    },
    {
      id: "3",
      title: "QA Engineer",
      department: "Engineering",
      location: "Mumbai, India",
      type: "Full-time",
      status: "paused",
      applications: 12,
      posted: "2026-01-10",
      deadline: "2026-02-10",
      salary: "₹8-12 LPA",
    },
    {
      id: "4",
      title: "Marketing Manager",
      department: "Marketing",
      location: "Delhi, India",
      type: "Full-time",
      status: "active",
      applications: 31,
      posted: "2026-01-05",
      deadline: "2026-02-05",
      salary: "₹15-22 LPA",
    },
    {
      id: "5",
      title: "Backend Developer",
      department: "Engineering",
      location: "Pune, India",
      type: "Contract",
      status: "closed",
      applications: 45,
      posted: "2025-12-20",
      deadline: "2026-01-20",
      salary: "₹10-14 LPA",
    },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesDepartment =
      filterDepartment === "all" || job.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "paused":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      case "closed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manage Jobs</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all job postings
          </p>
        </div>
        <button className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors self-start md:self-auto">
          + Post New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Jobs", value: jobs.length, color: "text-blue-600" },
          {
            label: "Active",
            value: jobs.filter((j) => j.status === "active").length,
            color: "text-green-600",
          },
          {
            label: "Paused",
            value: jobs.filter((j) => j.status === "paused").length,
            color: "text-yellow-600",
          },
          {
            label: "Closed",
            value: jobs.filter((j) => j.status === "closed").length,
            color: "text-gray-600",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
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
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
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
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedJobs(filteredJobs.map((j) => j.id));
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
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Job Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Applications
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Deadline
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredJobs.map((job) => (
                <motion.tr
                  key={job.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => toggleJobSelection(job.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-foreground">{job.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock size={12} />
                        {job.type}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">{job.department}</td>
                  <td className="px-4 py-4">
                    <span className="text-sm flex items-center gap-1">
                      <MapPin size={14} className="text-muted-foreground" />
                      {job.location}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      <Users size={14} />
                      {job.applications}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm flex items-center gap-1">
                      <Calendar size={14} className="text-muted-foreground" />
                      {new Date(job.deadline).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowMenu(showMenu === job.id ? null : job.id)
                        }
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {showMenu === job.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg z-10 overflow-hidden"
                        >
                          {[
                            { icon: Eye, label: "View Details", color: "" },
                            { icon: Edit2, label: "Edit Job", color: "" },
                            {
                              icon:
                                job.status === "active"
                                  ? PauseCircle
                                  : PlayCircle,
                              label:
                                job.status === "active"
                                  ? "Pause Job"
                                  : "Activate Job",
                              color: "",
                            },
                            { icon: Copy, label: "Duplicate", color: "" },
                            {
                              icon: Trash2,
                              label: "Delete",
                              color: "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20",
                            },
                          ].map((item) => (
                            <button
                              key={item.label}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors ${item.color}`}
                              onClick={() => setShowMenu(null)}
                            >
                              <item.icon size={16} />
                              {item.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} jobs
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
    </div>
  );
}