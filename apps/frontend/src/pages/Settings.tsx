import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Globe,
  Palette,
  Bell,
  Lock,
  Users,
  Mail,
  Database,
  Download,
  Trash2,
  AlertCircle,
  Check,
} from "lucide-react";

export default function Settings() {
  const [activeSection, setActiveSection] = useState<string>("general");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("system");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [showSuccess, setShowSuccess] = useState(false);

  const sections = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Lock },
    { id: "team", label: "Team Management", icon: Users },
    { id: "integrations", label: "Integrations", icon: Database },
  ];

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your application preferences and configurations
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check className="text-green-600 dark:text-green-400" size={20} />
          </div>
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">
              Settings Saved Successfully!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your preferences have been updated.
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-xl p-2 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon size={18} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-card border rounded-xl p-6">
            {/* General Settings */}
            {activeSection === "general" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <SettingsIcon size={20} />
                    General Settings
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe size={16} />
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी (Hindi)</option>
                      <option value="mr">मराठी (Marathi)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="Asia/Kolkata">
                        (GMT+5:30) India Standard Time
                      </option>
                      <option value="America/New_York">
                        (GMT-5:00) Eastern Time
                      </option>
                      <option value="Europe/London">
                        (GMT+0:00) London Time
                      </option>
                      <option value="Asia/Dubai">(GMT+4:00) Dubai Time</option>
                      <option value="Asia/Singapore">
                        (GMT+8:00) Singapore Time
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date Format
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time Format
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                      <option value="12">12-hour (AM/PM)</option>
                      <option value="24">24-hour</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Palette size={20} />
                    Appearance
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "light", label: "Light", preview: "bg-white" },
                        { value: "dark", label: "Dark", preview: "bg-gray-900" },
                        {
                          value: "system",
                          label: "System",
                          preview: "bg-gradient-to-br from-white to-gray-900",
                        },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTheme(option.value)}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            theme === option.value
                              ? "border-primary bg-primary/5"
                              : "border-input hover:border-primary/50"
                          }`}
                        >
                          <div
                            className={`w-full h-20 rounded-lg mb-3 ${option.preview} border`}
                          />
                          <p className="text-sm font-medium">{option.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Accent Color
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {[
                        "#3b82f6",
                        "#8b5cf6",
                        "#ec4899",
                        "#ef4444",
                        "#f97316",
                        "#eab308",
                        "#22c55e",
                        "#14b8a6",
                      ].map((color) => (
                        <button
                          key={color}
                          className="w-10 h-10 rounded-lg border-2 border-input hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Reduce spacing for more content
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bell size={20} />
                    Notification Preferences
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Desktop Notifications",
                      description: "Show notifications on your desktop",
                    },
                    {
                      title: "Email Digest",
                      description: "Receive daily summary emails",
                    },
                    {
                      title: "Mobile Push",
                      description: "Push notifications on mobile devices",
                    },
                    {
                      title: "Sound Alerts",
                      description: "Play sound for new notifications",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Privacy & Security */}
            {activeSection === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lock size={20} />
                    Privacy & Security
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        Security Notice
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Keep your account secure by enabling two-factor
                        authentication and regularly updating your password.
                      </p>
                    </div>
                  </div>

                  {[
                    {
                      title: "Two-Factor Authentication",
                      description: "Require 2FA for account access",
                    },
                    {
                      title: "Login Alerts",
                      description: "Notify me of new login attempts",
                    },
                    {
                      title: "Data Encryption",
                      description: "Encrypt sensitive data at rest",
                    },
                    {
                      title: "Activity Log",
                      description: "Track all account activities",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}

                  <div className="pt-4 border-t space-y-3">
                    <button className="w-full px-4 py-3 border-2 border-dashed border-input rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                      <Download size={18} />
                      Download My Data
                    </button>
                    <button className="w-full px-4 py-3 border-2 border-dashed border-red-200 dark:border-red-800 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center gap-2">
                      <Trash2 size={18} />
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Team Management */}
            {activeSection === "team" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users size={20} />
                    Team Management
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Allow Team Invites</p>
                      <p className="text-sm text-muted-foreground">
                        Let team members invite others
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Default Role for New Members
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t">
                    <button className="w-full px-4 py-3 border-2 border-dashed border-input rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                      <Mail size={18} />
                      Invite Team Members
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeSection === "integrations" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Database size={20} />
                    Integrations
                  </h2>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      name: "Google Calendar",
                      description: "Sync interview schedules",
                      connected: true,
                    },
                    {
                      name: "Slack",
                      description: "Get notifications in Slack",
                      connected: true,
                    },
                    {
                      name: "LinkedIn",
                      description: "Import candidate profiles",
                      connected: false,
                    },
                    {
                      name: "Zoom",
                      description: "Schedule video interviews",
                      connected: false,
                    },
                  ].map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          integration.connected
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {integration.connected ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}