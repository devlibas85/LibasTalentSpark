import { useParams, useNavigate } from "react-router-dom";
import { useGetJobByIdQuery, useUpdateJobMutation } from "@/store/api/jobApi";
import { useState, useCallback, useMemo } from "react";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { DEPARTMENTS } from "../../../types/constants/DEPARTMENTS";

export default function EditJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  // Use skip option properly
  const { data: job, isLoading, isError } = useGetJobByIdQuery(jobId!, {
    skip: !jobId,
    refetchOnMountOrArgChange: true,
  });

  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();

  // Initialize form data with default values
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    jobType: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    openings: "",
    deadline: "",
    description: "",
    responsibilities: "",
    requirements: "",
    skills: [] as string[],
    benefits: "",
    status: "draft",
  });

  const [skillInput, setSkillInput] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [currentJdPath, setCurrentJdPath] = useState<string>("");

  // Use useMemo to compute initial form data from job
  const initialFormData = useMemo(() => {
    if (!job) return null;
    
    return {
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      jobType: job.jobType || "",
      experienceLevel: job.experienceLevel || "",
      salaryMin: job.salaryMin?.toString() || "",
      salaryMax: job.salaryMax?.toString() || "",
      openings: job.openings?.toString() || "",
      deadline: job.deadline
        ? new Date(job.deadline).toISOString().split("T")[0]
        : "",
      description: job.description || "",
      responsibilities: job.responsibilities || "",
      requirements: job.requirements || "",
      skills: job.skills || [],
      benefits: job.benefits || "",
      status: job.status || "draft",
    };
  }, [job]);

  // Use useCallback for stable handlers
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAddSkill = useCallback(() => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  }, [skillInput, formData.skills]);

  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setJdFile(e.target.files[0]);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("department", formData.department);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("jobType", formData.jobType);
    formDataToSend.append("experienceLevel", formData.experienceLevel);
    formDataToSend.append("salaryMin", formData.salaryMin);
    formDataToSend.append("salaryMax", formData.salaryMax);
    formDataToSend.append("openings", formData.openings);
    formDataToSend.append("deadline", formData.deadline);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("responsibilities", formData.responsibilities);
    formDataToSend.append("requirements", formData.requirements);
    formDataToSend.append("skills", JSON.stringify(formData.skills));
    formDataToSend.append("benefits", formData.benefits);
    formDataToSend.append("status", formData.status);

    if (jdFile) {
      formDataToSend.append("jdPdf", jdFile);
    }

    try {
      await updateJob({ id: jobId!, data: formDataToSend }).unwrap();
      navigate("/jobs/manage");
    } catch (error) {
      console.error("Failed to update job:", error);
      alert("Failed to update job. Please try again.");
    }
  };

  // Handle skill input key press
  const handleSkillKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  }, [handleAddSkill]);

  // Initialize form data when job data is loaded
  if (job && initialFormData && !formData.title && formData.title !== initialFormData.title) {
    setFormData(initialFormData);
    if (job.jdPdf) {
      setCurrentJdPath(job.jdPdf);
    }
  }

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

  if (isError || !job || !jobId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">
            {!jobId ? "Invalid job ID" : "Job not found"}
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/jobs/manage")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </button>
        <h1 className="text-3xl font-bold">Edit Job</h1>
        <p className="text-muted-foreground mt-1">
          Update job posting details
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Department *
              </label>
             <select
  name="department"
  value={formData.department}
  onChange={handleInputChange}
  required
  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
>
  <option value="">Select Department</option>
  {DEPARTMENTS.map((dept) => (
    <option key={dept.value} value={dept.value}>
      {dept.label}
    </option>
  ))}
</select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. Bangalore, India"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Job Type *
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Job Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Experience Level *
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Experience Level</option>
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior-level">Senior-level</option>
                <option value="Lead">Lead</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Openings
              </label>
              <input
                type="number"
                name="openings"
                value={formData.openings}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Salary (₹)
              </label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 500000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Salary (₹)
              </label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 1000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Job Details</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Describe the role and what the candidate will be doing..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Key Responsibilities
            </label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="List the main responsibilities..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Requirements
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="List the qualifications and requirements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Benefits
            </label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="List the benefits offered..."
            />
          </div>
        </div>

        {/* Skills */}
        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Required Skills</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleSkillKeyPress}
              className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Add a skill and press Enter"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-primary/70"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* JD PDF Upload */}
        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Job Description Document</h2>

          {currentJdPath && !jdFile && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Current JD PDF:
              </p>
              <a
                href={currentJdPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                View current PDF
              </a>
            </div>
          )}

          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <label className="cursor-pointer">
              <span className="text-primary hover:underline">
                {jdFile ? "Change file" : "Upload new JD PDF"}
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {jdFile && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {jdFile.name}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/jobs/manage")}
            className="flex-1 px-6 py-3 border rounded-lg hover:bg-muted transition-colors"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Job"
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}