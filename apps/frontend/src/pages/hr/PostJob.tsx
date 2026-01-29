import { useState } from "react";
import { motion } from "framer-motion";
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

} from "@/store/jobFormSlice";
import {
  useCreateJobMutation,

} from "@/store/jobApi";

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

  const [createJob] = useCreateJobMutation();
  

  const [currentSkill, setCurrentSkill] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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

  console.log("🚀 Job data being sent:", formData);

  try {
    await createJob(formData).unwrap();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  } catch (error) {
    console.error("❌ Failed to create job:", error);
  }
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
      {/* <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FileUp className="text-primary" size={20} />
          <h2 className="text-lg font-semibold">Quick Upload</h2>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Job Description (PDF/DOCX/TXT)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex-1 cursor-pointer">
              <div className="px-4 py-3 rounded-lg border-2 border-dashed border-input hover:border-primary transition-colors text-center">
                <FileUp className="inline-block mr-2" size={18} />
                <span className="text-sm">Choose file or drag & drop</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports .pdf, .doc, .docx, .txt files
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleJDUpload}
                className="hidden"
              />
            </label>
          </div>
          {isParsing && (
            <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                ⏳
              </motion.span>
              Parsing job description...
            </p>
          )}
        </div>
      </div> */}

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <AlertCircle className="text-green-600 dark:text-green-400" size={20} />
          </div>
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">
              Job Posted Successfully!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your job posting is now live and visible to candidates.
            </p>
          </div>
        </motion.div>
      )}

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
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="HR">Human Resources</option>
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
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-6 py-2.5 rounded-lg border border-input hover:bg-accent transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Upload size={18} />
            Publish Job
          </button>
        </div>
      </form>
    </div>
  );
}