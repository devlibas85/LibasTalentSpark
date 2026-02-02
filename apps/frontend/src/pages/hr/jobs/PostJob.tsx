/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  FileText,
  Tag,
  Calendar,
  TrendingUp,
  Upload,
  X,
  AlertCircle,
  
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  updateField,

} from "@/store/slice/jobFormSlice";
import {
  useCreateJobMutation,

} from "@/store/api/jobApi";

import { toast } from "sonner";


interface JobFormData {
  title: string;
  department: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  openings: string;
  deadline: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string[];
  benefits: string;
}

export default function PostJob() {
  const dispatch = useDispatch();
  const formData = useSelector((state: RootState) => state.jobForm);

  const [submitMode, setSubmitMode] = useState<"draft" | "published">("published");


  const [createJob] = useCreateJobMutation();
  const navigate = useNavigate();

const [jdFile, setJdFile] = useState<File | null>(null);
const [jdError, setJdError] = useState<string | null>(null);

  const [currentSkill, setCurrentSkill] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    dispatch(
      updateField({
        name: e.target.name as keyof JobFormData,
        value: e.target.value,
      })
    );
  };

  const handleAddSkill = () => {
    if (
      currentSkill.trim() &&
      !formData.skills.includes(currentSkill.trim())
    ) {
      dispatch(
        updateField({
          name: "skills",
          value: [...formData.skills, currentSkill.trim()],
        })
      );
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    dispatch(
      updateField({
        name: "skills",
        value: formData.skills.filter((skill) => skill !== skillToRemove),
      })
    );
  };

 
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const toastId = toast.loading(
    submitMode === "published"
      ? "Publishing job..."
      : "Saving draft..."
  );

  const payload = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      payload.append(key, JSON.stringify(value));
    } else {
      payload.append(key, value);
    }
  });

  payload.append("status", submitMode); // ✅ FIX

  if (jdFile) {
    payload.append("jdPdf", jdFile);
  }

  try {
    await createJob(payload).unwrap();

    toast.success(
      submitMode === "published"
        ? "Job posted successfully!"
        : "Draft saved",
      {
        id: toastId,
      }
    );

    navigate("/jobs/manage");
  } catch (error: any) {
    toast.error("Failed to save job", {
      id: toastId,
      description:
        error?.data?.error || "Please check details and try again",
    });
  }
};




const handleJDUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];

  if (!file) return;

if (file.type !== "application/pdf") {
  setJdError("Only PDF files are allowed");
  toast.error("Invalid file type", {
    description: "Please upload a PDF file only",
  });
  return;
}

if (file.size > 5 * 1024 * 1024) {
  setJdError("PDF size must be under 5MB");
  toast.error("File too large", {
    description: "PDF size must be under 5MB",
  });
  return;
}


  setJdError(null);
  setJdFile(file);
};


  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Post New Job</h1>
        <p className="text-muted-foreground mt-1">
          Fill in the details to create a new job posting
        </p>
      </div>

      {/* JD Upload Section */}
    <div className="bg-card border rounded-xl p-6 space-y-4">
  <div className="flex items-center gap-2 mb-4">
    <FileText className="text-primary" size={20} />
    <h2 className="text-lg font-semibold">Job Description PDF</h2>
  </div>

  <label className="block text-sm font-medium mb-2">
    Upload JD (PDF only)
  </label>

  {!jdFile ? (
    <label className="cursor-pointer">
      <div className="px-4 py-6 rounded-lg border-2 border-dashed border-input hover:border-primary transition-colors text-center">
        <Upload className="mx-auto mb-2" size={20} />
        <p className="text-sm">Click to upload PDF</p>
        <p className="text-xs text-muted-foreground mt-1">
          Max size: 5MB
        </p>
      </div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleJDUpload}
        className="hidden"
      />
    </label>
  ) : (
    <div className="flex items-center justify-between bg-accent rounded-lg px-4 py-3">
      <div className="flex items-center gap-2">
        <FileText size={18} />
        <span className="text-sm">{jdFile.name}</span>
      </div>
      <button
        type="button"
        onClick={() => setJdFile(null)}
        className="text-destructive hover:underline text-sm"
      >
        Remove
      </button>
    </div>
  )}

  {jdError && (
    <p className="text-sm text-destructive flex items-center gap-2">
      <AlertCircle size={16} />
      {jdError}
    </p>
  )}
</div>


     

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-card border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="text-primary" size={20} />
            <h2 className="text-lg font-semibold">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Senior React Developer"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="">Select Department</option>
                <option value="Finance">FINANCE & ACCOUNTS</option>
                <option value="crm">CRM</option>
                <option value="tech">TECH & DE</option>
                <option value="auditing">ADUITING</option>
                <option value="admin">ADMIN</option>
                <option value="founder">FOUNDER OFFICE</option>
                <option value="catalogue">CATALOGUE</option>
                <option value="ecommerce">ECOMMERCE </option>
                <option value="HR">HUMAN RESOURCE</option>
                <option value="Marketing">MARKETING</option>
                <option value="Mis">MIS</option>
                <option value="Retailebo">RETAIL EBO</option>
                <option value="Retail">RETAIL</option>
                <option value="Project">PROJECT</option>
                <option value="Planning">CENTRAL PLANNING</option>
                <option value="Buying">BUYING</option>
                <option value="Fashion">FASHION DESIGNING & MERCHANDISING</option>
                <option value="Production">PRODUCTION</option>
                <option value="Supply">SUPPLY CHAIN</option>
                <option value="Warehouse"> WAREHOUSE OPERATIONS</option>
                
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin size={16} />
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Bangalore, India"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Clock size={16} />
                Job Type *
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <TrendingUp size={16} />
                Experience Level *
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="Entry-level">Entry-level (0-2 years)</option>
                <option value="Mid-level">Mid-level (2-5 years)</option>
                <option value="Senior">Senior (5-10 years)</option>
                <option value="Lead">Lead (10+ years)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compensation & Details */}
        <div className="bg-card border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-primary" size={20} />
            <h2 className="text-lg font-semibold">Compensation & Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Salary Range (Min) *
              </label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleInputChange}
                placeholder="e.g., 800000"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Salary Range (Max) *
              </label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleInputChange}
                placeholder="e.g., 1200000"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Users size={16} />
                No. of Openings *
              </label>
              <input
                type="number"
                name="openings"
                value={formData.openings}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Application Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-card border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-primary" size={20} />
            <h2 className="text-lg font-semibold">Job Description</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Job Overview *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Provide a brief overview of the role..."
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Key Responsibilities *
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleInputChange}
                rows={5}
                placeholder="List the main responsibilities (one per line)..."
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Requirements & Qualifications *
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={5}
                placeholder="List the required qualifications and experience..."
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Tag size={16} />
                Required Skills *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-primary/70"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Benefits & Perks
              </label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                rows={4}
                placeholder="List the benefits offered with this position..."
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
       <button
  type="button"
  onClick={() => {
    setSubmitMode("draft");
    toast.info("Draft saved", {
      description: "You can continue editing later",
    });
  }}
  className="px-6 py-2.5 rounded-lg border border-input hover:bg-accent transition-colors"
>
  Save as Draft
</button>

<button
  type="submit"
  onClick={() => setSubmitMode("published")}
  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
>
  <Upload size={18} />
  Publish Job
</button>

      </form>
    </div>
  );
}