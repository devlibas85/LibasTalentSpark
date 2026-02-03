
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Globe,
  Camera,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useProfile } from "../hooks/userProfile";
import { DEPARTMENTS } from "../types/constants/DEPARTMENTS";


export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    department: "",
    position: "",
    joinDate: "",
    website: "",
    bio: "",
  });
  
  const {
    profile,
    isFetching,
    isUpdating,
    error,
    updateProfile,
    isProfileComplete,
  } = useProfile();

  // Initialize local state with profile data
  useEffect(() => {
    if (!profile) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalProfile({
      name: profile.name ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      location: profile.location ?? "",
      department: profile.department ?? "",
      position: profile.position ?? "",
      joinDate: profile.joinDate ?? "",
      website: profile.website ?? "",
      bio: profile.bio ?? "",
    });

    // Automatically enable editing if profile is incomplete
    if (!isProfileComplete && !isEditing) {
      setIsEditing(true);
    }
  }, [profile, isProfileComplete, isEditing]);

  const handleSave = async () => {
    const result = await updateProfile(localProfile);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setLocalProfile({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      location: profile?.location || "",
      department: profile?.department || "",
      position: profile?.position || "",
      joinDate: profile?.joinDate || "",
      website: profile?.website || "",
      bio: profile?.bio || "",
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    // You can implement avatar upload here
    console.debug('Uploading avatar:', file.name);
  };

  const getInitials = () => {
    if (!profile?.name?.trim()) return "U";
    return profile.name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isFieldEmpty = (value: string) => !value.trim();

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Profile Not Found</h3>
          <p className="text-muted-foreground mt-2">
            Unable to load your profile. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {!isProfileComplete && isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <p className="text-yellow-800 font-medium">Complete Your Profile</p>
            <p className="text-yellow-700 text-sm mt-1">
              Please fill in all required fields marked with * to complete your profile setup.
            </p>
          </div>
        </motion.div>
      )}

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-xl p-6"
          >
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-4xl font-bold text-primary-foreground">
                  {profile.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                  />
                  <Camera size={18} />
                </label>
              </div>

              <h2 className="text-xl font-semibold mb-1">
                {profile.name || "Your Name"}
              </h2>
              <p className="text-sm text-muted-foreground mb-1">
                {profile.position || "Your Position"}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile.department || "Your Department"}
              </p>

              {isProfileComplete && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  <CheckCircle size={14} />
                  Profile Complete
                </div>
              )}

              <div className="mt-6 pt-6 border-t space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className={isFieldEmpty(profile.email) ? "text-muted-foreground italic" : "text-foreground"}>
                    {profile.email || "No email provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-muted-foreground" />
                  <span className={isFieldEmpty(profile.phone) ? "text-muted-foreground italic" : "text-foreground"}>
                    {profile.phone || "No phone number"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span className={isFieldEmpty(profile.location) ? "text-muted-foreground italic" : "text-foreground"}>
                    {profile.location || "No location"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span className={isFieldEmpty(profile.joinDate) ? "text-muted-foreground italic" : "text-foreground"}>
                    {profile.joinDate ? `Joined ${profile.joinDate}` : "Join date not set"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="flex items-center gap-4">
                {!isProfileComplete && (
                  <span className="text-sm text-yellow-600 flex items-center gap-1">
                    <AlertCircle size={16} />
                    Incomplete Profile
                  </span>
                )}
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                      disabled={isUpdating}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {[
    { 
      label: "Full Name *", 
      key: "name", 
      icon: User, 
      placeholder: "Enter your full name",
      type: "text",
      required: true
    },
    { 
      label: "Email Address *", 
      key: "email", 
      icon: Mail, 
      placeholder: "Enter your email address",
      type: "email",
      required: true
    },
    { 
      label: "Phone Number *", 
      key: "phone", 
      icon: Phone, 
      placeholder: "Enter your phone number",
      type: "tel",
      required: true
    },
    { 
      label: "Location *", 
      key: "location", 
      icon: MapPin, 
      placeholder: "Enter your location",
      type: "text",
      required: true
    },
    // Department field - placed right after location
    { 
      label: "Department *", 
      key: "department", 
      icon: Briefcase, 
      placeholder: "Select your department",
      type: "select",
      required: true
    },
    { 
      label: "Job Title *", 
      key: "position", 
      icon: Briefcase, 
      placeholder: "Enter your job title",
      type: "text",
      required: true
    },
    { 
      label: "Join Date", 
      key: "joinDate", 
      icon: Calendar, 
      placeholder: "MM/YYYY",
      type: "text",
      required: false
    },
    { 
      label: "Website / LinkedIn", 
      key: "website", 
      icon: Globe, 
      placeholder: "https://linkedin.com/in/username",
      type: "text",
      required: false
    },
  ].map(({ label, key, icon: Icon, placeholder, type, required }) => (
    <div key={key} className={key === 'website' ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        
        {/* Render select for department, input for others */}
        {key === 'department' ? (
          <select
            value={localProfile.department}
            onChange={(e) =>
              setLocalProfile({ ...localProfile, department: e.target.value })
            }
            disabled={!isEditing}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type === 'select' ? 'text' : type}
            value={localProfile[key as keyof typeof localProfile]}
            onChange={(e) =>
              setLocalProfile({ ...localProfile, [key]: e.target.value })
            }
            disabled={!isEditing}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />
        )}
        
        {required && !localProfile[key as keyof typeof localProfile]?.trim() && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm">
            *
          </span>
        )}
      </div>
    </div>
  ))}

  <div className="md:col-span-2">
    <label className="block text-sm font-medium mb-2">Bio</label>
    <textarea
      value={localProfile.bio}
      onChange={(e) =>
        setLocalProfile({ ...localProfile, bio: e.target.value })
      }
      disabled={!isEditing}
      rows={4}
      placeholder="Tell us about yourself..."
      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed resize-none"
    />
  </div>
</div>

            {/* Required Fields Note */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Fields marked with * are required. Your profile must be complete to access all features.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}