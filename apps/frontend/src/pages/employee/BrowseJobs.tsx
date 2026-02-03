import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  Filter,
  X,
  Send,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useGetJobsQuery } from "@/store/api/jobApi";
import { useSubmitReferralMutation } from "@/store/api/refralApi";

export default function BrowseJobs() {
  const { data: allJobs = [], isLoading, isError } = useGetJobsQuery();
  const [submitReferral, { isLoading: isSubmitting }] = useSubmitReferralMutation();

  // Filter for published jobs only
  const publishedJobs = useMemo(
    () => allJobs.filter((job) => job.status === "published" && !job.deleted),
    [allJobs]
  );

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
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

  // Get unique values for filters
  const departments = useMemo(
    () => ["all", ...new Set(publishedJobs.map((job) => job.department))],
    [publishedJobs]
  );
  const locations = useMemo(
    () => ["all", ...new Set(publishedJobs.map((job) => job.location))],
    [publishedJobs]
  );
  const jobTypes = useMemo(
    () => ["all", ...new Set(publishedJobs.map((job) => job.jobType))],
    [publishedJobs]
  );

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return publishedJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment =
        selectedDepartment === "all" || job.department === selectedDepartment;
      const matchesLocation =
        selectedLocation === "all" || job.location === selectedLocation;
      const matchesJobType =
        selectedJobType === "all" || job.jobType === selectedJobType;

      return matchesSearch && matchesDepartment && matchesLocation && matchesJobType;
    });
  }, [publishedJobs, searchTerm, selectedDepartment, selectedLocation, selectedJobType]);

  // Stats
  const stats = [
    {
      label: "Total Openings",
      value: publishedJobs.length,
      icon: Briefcase,
      color: "from-primary/20 to-primary/5",
      iconColor: "text-primary bg-primary/10",
    },
    {
      label: "Departments",
      value: departments.length - 1,
      icon: Building2,
      color: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Locations",
      value: locations.length - 1,
      icon: MapPin,
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Active Filters",
      value:
        (selectedDepartment !== "all" ? 1 : 0) +
        (selectedLocation !== "all" ? 1 : 0) +
        (selectedJobType !== "all" ? 1 : 0),
      icon: Filter,
      color: "from-purple-500/20 to-purple-500/5",
      iconColor: "text-purple-500 bg-purple-500/10",
    },
  ];

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
      return `₹${(num / 1000).toFixed(0)}K`;
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const openReferralForm = (jobId: string) => {
    setSelectedJob(jobId);
    setShowReferralForm(true);
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitReferral({
        candidateName: referralData.candidateName,
        candidateEmail: referralData.candidateEmail,
        candidatePhone: referralData.candidatePhone,
        relationship: referralData.relationship,
        notes: referralData.notes,
        jobId: selectedJob || "",
        resumeFile: referralData.resumeFile,
      }).unwrap();

      toast.success("Referral submitted");
      setShowReferralForm(false);
      setReferralData({
        candidateName: "",
        candidateEmail: "",
        candidatePhone: "",
        relationship: "",
        resumeFile: null,
        notes: "",
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Referral submit error:", err);
      toast.error("Failed to submit referral. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReferralData({ ...referralData, resumeFile: e.target.files[0] });
    }
  };

  const clearFilters = () => {
    setSelectedDepartment("all");
    setSelectedLocation("all");
    setSelectedJobType("all");
    setSearchTerm("");
  };

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center p-6 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load jobs</p>
          <p className="text-sm text-red-500 dark:text-red-300 mt-1">
            Please try refreshing the page
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Browse Jobs
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover opportunities and refer talented candidates
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <AnimatePresence>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`relative overflow-hidden border rounded-2xl p-5 bg-gradient-to-br ${stat.color} hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${stat.iconColor}`}>
                      <Icon size={20} />
                    </div>
                    <TrendingUp
                      size={16}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-card border rounded-2xl p-5 space-y-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <input
              type="text"
              placeholder="Search jobs by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Filter Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-2.5 rounded-lg border font-medium transition-all flex items-center gap-2 ${
              showFilters
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            <Filter size={18} />
            Filters
            <ChevronDown
              size={16}
              className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </motion.button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Building2 size={16} className="text-primary" />
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept === "all" ? "All Departments" : dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-500" />
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc === "all" ? "All Locations" : loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    Job Type
                  </label>
                  <select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "all" ? "All Types" : type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedDepartment !== "all" ||
                selectedLocation !== "all" ||
                selectedJobType !== "all" ||
                searchTerm) && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 rounded-lg border hover:bg-accent transition-all flex items-center gap-2 text-sm font-medium"
                >
                  <X size={16} />
                  Clear all filters
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredJobs.length}</span> of{" "}
          <span className="font-semibold text-foreground">{publishedJobs.length}</span> jobs
        </p>
      </motion.div>

      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Briefcase className="text-primary" size={32} />
          </div>
          <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or search terms
          </p>
          {(selectedDepartment !== "all" ||
            selectedLocation !== "all" ||
            selectedJobType !== "all" ||
            searchTerm) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-lg transition-all"
            >
              Clear all filters
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence>
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative border rounded-xl p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Building2 size={14} />
                        {job.department}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow-lg"
                    >
                      <Sparkles size={10} />
                      Bonus
                    </motion.div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {job.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin size={14} className="text-primary flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={14} className="text-blue-500 flex-shrink-0" />
                      <span>{job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <DollarSign size={14} className="text-emerald-500 flex-shrink-0" />
                      <span className="font-semibold text-foreground">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Posted Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Calendar size={12} />
                    <span>
                      Posted{" "}
                      {new Date(job.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openReferralForm(job._id)}
                    className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-sm font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                  >
                    <Send size={16} />
                    Refer a Candidate
                    <ArrowRight
                      size={16}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Referral Form Modal */}
      <AnimatePresence>
        {showReferralForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !isSubmitting && setShowReferralForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Submit Referral
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Help us find great talent and earn rewards
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowReferralForm(false)}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                  disabled={isSubmitting}
                >
                  <X size={18} />
                </motion.button>
              </div>

              <form onSubmit={handleReferralSubmit} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    Candidate Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={referralData.candidateName}
                    onChange={(e) =>
                      setReferralData({ ...referralData, candidateName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter full name"
                    disabled={isSubmitting}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Users size={16} className="text-blue-500" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={referralData.candidateEmail}
                    onChange={(e) =>
                      setReferralData({ ...referralData, candidateEmail: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="candidate@example.com"
                    disabled={isSubmitting}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Users size={16} className="text-emerald-500" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={referralData.candidatePhone}
                    onChange={(e) =>
                      setReferralData({ ...referralData, candidatePhone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="+91 XXXXX XXXXX"
                    disabled={isSubmitting}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    Relationship to Candidate *
                  </label>
                  <select
                    required
                    value={referralData.relationship}
                    onChange={(e) =>
                      setReferralData({ ...referralData, relationship: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    disabled={isSubmitting}
                  >
                    <option value="">Select relationship</option>
                    <option value="friend">Friend</option>
                    <option value="former_colleague">Former Colleague</option>
                    <option value="family">Family Member</option>
                    <option value="acquaintance">Acquaintance</option>
                    <option value="other">Other</option>
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium mb-2">Resume/CV *</label>
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-2.5 border rounded-lg bg-background file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium hover:file:bg-primary/90 transition-all"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, DOC, or DOCX (Max 5MB)
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-sm font-medium mb-2">Additional Notes</label>
                  <textarea
                    value={referralData.notes}
                    onChange={(e) =>
                      setReferralData({ ...referralData, notes: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    rows={4}
                    placeholder="Why do you think this candidate would be a good fit?"
                    disabled={isSubmitting}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-3 pt-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowReferralForm(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border hover:bg-accent transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Referral
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-4 right-4 text-xs text-muted-foreground"
      >
        <div className="flex items-center gap-2 bg-card border rounded-full px-3 py-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Live • {filteredJobs.length} jobs available</span>
        </div>
      </motion.div>
    </motion.div>
  );
}