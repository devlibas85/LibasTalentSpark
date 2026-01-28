import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Clock,
  DollarSign,
  Award,
  Download,
  Calendar,
  Filter,
} from "lucide-react";

export default function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState("last_30_days");
  const [reportType, setReportType] = useState("overview");

  // Sample metrics
  const metrics = [
    {
      label: "Total Applications",
      value: "1,247",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950",
    },
    {
      label: "Active Jobs",
      value: "24",
      change: "+3",
      trend: "up",
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950",
    },
    {
      label: "Time to Hire",
      value: "18 days",
      change: "-2 days",
      trend: "up",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950",
    },
    {
      label: "Avg. Cost per Hire",
      value: "₹45,000",
      change: "-5%",
      trend: "up",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-950",
    },
  ];

  // Hiring funnel data
  const funnelData = [
    { stage: "Applied", count: 450, percentage: 100 },
    { stage: "Screening", count: 320, percentage: 71 },
    { stage: "Interview", count: 180, percentage: 40 },
    { stage: "Offer", count: 85, percentage: 19 },
    { stage: "Hired", count: 62, percentage: 14 },
  ];

  // Department performance
  const departmentData = [
    { department: "Engineering", openings: 12, applications: 340, hires: 8 },
    { department: "Design", openings: 5, applications: 120, hires: 3 },
    { department: "Marketing", openings: 4, applications: 180, hires: 5 },
    { department: "Sales", openings: 8, applications: 240, hires: 6 },
    { department: "Product", openings: 3, applications: 95, hires: 2 },
  ];

  // Monthly trend data
  const monthlyTrend = [
    { month: "Aug", applications: 180, hires: 12 },
    { month: "Sep", applications: 220, hires: 15 },
    { month: "Oct", applications: 195, hires: 10 },
    { month: "Nov", applications: 250, hires: 18 },
    { month: "Dec", applications: 280, hires: 20 },
    { month: "Jan", applications: 320, hires: 25 },
  ];

  // Source of hire
  const sourceData = [
    { source: "Job Boards", percentage: 35, count: 220 },
    { source: "Employee Referrals", percentage: 28, count: 175 },
    { source: "LinkedIn", percentage: 22, count: 138 },
    { source: "Career Page", percentage: 10, count: 63 },
    { source: "Campus", percentage: 5, count: 31 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track hiring performance and key metrics
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
            <Filter size={18} />
            Filters
          </button>
          <button className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date Range</label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="last_year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="overview">Overview</option>
              <option value="recruitment">Recruitment</option>
              <option value="performance">Performance</option>
              <option value="diversity">Diversity</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Department</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
              <option value="all">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon size={20} className={metric.color} />
              </div>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  metric.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {metric.trend === "up" ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                {metric.change}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
            <p className="text-2xl font-bold">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Hiring Funnel</h2>
            <span className="text-sm text-muted-foreground">Last 30 days</span>
          </div>

          <div className="space-y-4">
            {funnelData.map((item, index) => (
              <div key={item.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {item.count}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 flex items-center justify-end pr-3"
                  >
                    <span className="text-xs font-medium text-primary-foreground">
                      {item.count}
                    </span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Monthly Trend</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Hires</span>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-2">
            {monthlyTrend.map((item, index) => {
              const maxValue = Math.max(...monthlyTrend.map((d) => d.applications));
              const appHeight = (item.applications / maxValue) * 100;
              const hireHeight = (item.hires / maxValue) * 100;

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end h-48">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${appHeight}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex-1 bg-primary rounded-t relative group"
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.applications}
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${hireHeight}%` }}
                      transition={{ delay: index * 0.1 + 0.05, duration: 0.5 }}
                      className="flex-1 bg-green-500 rounded-t relative group"
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.hires}
                      </span>
                    </motion.div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source of Hire */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">Source of Hire</h2>

          <div className="space-y-4">
            {sourceData.map((item, index) => (
              <div key={item.source}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.source}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {item.count}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">Department Performance</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                    Department
                  </th>
                  <th className="text-center py-2 text-sm font-medium text-muted-foreground">
                    Openings
                  </th>
                  <th className="text-center py-2 text-sm font-medium text-muted-foreground">
                    Applications
                  </th>
                  <th className="text-center py-2 text-sm font-medium text-muted-foreground">
                    Hires
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {departmentData.map((dept) => (
                  <motion.tr
                    key={dept.department}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="py-3 text-sm font-medium">{dept.department}</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-sm font-medium">
                        {dept.openings}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 text-sm font-medium">
                        {dept.applications}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 text-green-600 text-sm font-medium">
                        {dept.hires}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6">Top Performers</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-950 dark:to-yellow-900 rounded-xl">
            <Award size={32} className="mx-auto mb-3 text-yellow-600" />
            <h3 className="font-semibold text-lg mb-1">Fastest Hiring</h3>
            <p className="text-2xl font-bold text-yellow-600 mb-1">12 days</p>
            <p className="text-sm text-muted-foreground">Marketing Dept.</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-950 dark:to-green-900 rounded-xl">
            <Users size={32} className="mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold text-lg mb-1">Most Applications</h3>
            <p className="text-2xl font-bold text-green-600 mb-1">340</p>
            <p className="text-sm text-muted-foreground">Engineering Dept.</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 rounded-xl">
            <TrendingUp size={32} className="mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold text-lg mb-1">Best Conversion</h3>
            <p className="text-2xl font-bold text-blue-600 mb-1">18%</p>
            <p className="text-sm text-muted-foreground">Design Dept.</p>
          </div>
        </div>
      </div>
    </div>
  );
}