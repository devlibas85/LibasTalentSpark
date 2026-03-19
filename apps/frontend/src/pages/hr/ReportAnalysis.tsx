import { useMemo } from "react";
import { motion } from "framer-motion";
import { Award, Calendar, Clock, Zap, Target, UserPlus } from "lucide-react";
import { useGetAllReferralsQuery } from "../../store/api/refralApi";
import { useGetJobsQuery } from "../../store/api/jobApi";
export interface Job {
  _id: string;
  title: string;
  location?: string;

  status?: "draft" | "published" | "closed"; // ✅ add this
  isActive?: boolean; // ✅ add this
}
// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("en-IN");

function avg(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function daysBetween(a: string, b: string) {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24),
  );
}

// ─── Mini bar (reused) ────────────────────────────────────────────────────────

function Bar({
  pct,
  color = "bg-primary",
  delay = 0,
}: {
  pct: number;
  color?: string;
  delay?: number;
}) {
  return (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, delay }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon size={20} className={color} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ReportsAnalytics() {
  const { data: referrals = [], isLoading: refLoading } =
    useGetAllReferralsQuery();
  const { data: jobs = [], isLoading: jobLoading } = useGetJobsQuery();

  const filtered = referrals;

  // ── pipeline counts ───────────────────────────────────────────────────────
  const counts = useMemo(
    () => ({
      total: filtered.length,
      submitted: filtered.filter((r) => r.status === "submitted").length,
      under_review: filtered.filter((r) => r.status === "under_review").length,
      interview: filtered.filter((r) => r.status === "interview_scheduled")
        .length,
      hired: filtered.filter((r) => r.status === "hired").length,
      rejected: filtered.filter((r) => r.status === "rejected").length,
    }),
    [filtered],
  );

  // ── conversion rate ───────────────────────────────────────────────────────
  const conversionRate =
    counts.total > 0 ? Math.round((counts.hired / counts.total) * 100) : 0;

  // ── avg AI score ──────────────────────────────────────────────────────────
  const aiScores = filtered
    .map((r) => r.aiEvaluation?.summary?.score)
    .filter((s): s is number => s !== undefined && s !== null);
  const avgAiScore = Math.round(avg(aiScores));

  // ── avg days to hire (submitted → hired) ──────────────────────────────────
  const daysToHire = filtered
    .filter((r) => r.status === "hired")
    .map((r) => {
      const submitted = r.actionHistory?.find((a) => a.action === "submitted");
      const hired = r.actionHistory?.find((a) => a.action === "hired");
      if (submitted && hired)
        return daysBetween(submitted.actionAt, hired.actionAt);
      return daysBetween(r.createdAt, r.updatedAt);
    });
  const avgDays = Math.round(avg(daysToHire));

  // ── referrer leaderboard ──────────────────────────────────────────────────
  const referrerMap = useMemo(() => {
    const m = new Map<
      string,
      {
        name: string;
        total: number;
        hired: number;
        avgScore: number;
        scores: number[];
      }
    >();
    filtered.forEach((r) => {
      const key = r.referredBy._id;
      const prev = m.get(key) ?? {
        name: r.referredBy.name,
        total: 0,
        hired: 0,
        avgScore: 0,
        scores: [],
      };
      const score = r.aiEvaluation?.summary?.score;
      m.set(key, {
        ...prev,
        total: prev.total + 1,
        hired: prev.hired + (r.status === "hired" ? 1 : 0),
        scores: score !== undefined ? [...prev.scores, score] : prev.scores,
      });
    });
    return Array.from(m.values())
      .map((v) => ({ ...v, avgScore: Math.round(avg(v.scores)) }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  // ── per-job stats ─────────────────────────────────────────────────────────
  const jobStats = useMemo(() => {
    const m = new Map<
      string,
      { title: string; total: number; hired: number; rejected: number }
    >();
    filtered.forEach((r) => {
      const key = r.job._id;
      const prev = m.get(key) ?? {
        title: r.job.title,
        total: 0,
        hired: 0,
        rejected: 0,
      };
      m.set(key, {
        ...prev,
        total: prev.total + 1,
        hired: prev.hired + (r.status === "hired" ? 1 : 0),
        rejected: prev.rejected + (r.status === "rejected" ? 1 : 0),
      });
    });
    return Array.from(m.values()).sort((a, b) => b.total - a.total);
  }, [filtered]);

  // ── relationship breakdown ────────────────────────────────────────────────
  const relMap = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach((r) => {
      m[r.relationship] = (m[r.relationship] ?? 0) + 1;
    });
    return Object.entries(m)
      .map(([rel, count]) => ({ rel, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // ── AI score distribution ─────────────────────────────────────────────────
  const scoreBuckets = useMemo(() => {
    const buckets = [
      { label: "Excellent (85+)", min: 85, max: 101, color: "bg-emerald-500" },
      { label: "Strong (70–84)", min: 70, max: 85, color: "bg-green-400" },
      { label: "Moderate (50–69)", min: 50, max: 70, color: "bg-yellow-400" },
      { label: "Weak (<50)", min: 0, max: 50, color: "bg-red-400" },
    ];
    return buckets.map((b) => ({
      ...b,
      count: aiScores.filter((s) => s >= b.min && s < b.max).length,
    }));
  }, [aiScores]);

  // ── monthly trend (last 6 months from real data) ──────────────────────────
  const monthlyTrend = useMemo(() => {
    const months: { label: string; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleString("default", { month: "short" }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      });
    }
    return months.map(({ label, key }) => {
      const month = referrals.filter((r) => r.createdAt.startsWith(key));
      return {
        label,
        submitted: month.length,
        hired: month.filter((r) => r.status === "hired").length,
      };
    });
  }, [referrals]);

  const maxMonthly = Math.max(...monthlyTrend.map((m) => m.submitted), 1);

  // ── job board ─────────────────────────────────────────────────────────────
  const activeJobs = jobs.filter(
    (j) => j.status === "published" || (j as Job).isActive,
  );
  const closedJobs = jobs.filter((j) => (j as Job).status === "closed");

  // ── loading ───────────────────────────────────────────────────────────────
  if (refLoading || jobLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading analytics…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Live data from your referrals and job listings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date filter */}
          <div className="text-sm text-muted-foreground">
            Showing:{" "}
            <span className="font-medium text-foreground">All Time</span>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Referrals"
          value={fmt(counts.total)}
          icon={UserPlus}
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          label="Hired"
          value={counts.hired}
          sub={`${conversionRate}% conversion`}
          icon={Award}
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-950/30"
        />
        <StatCard
          label="In Interview"
          value={counts.interview}
          icon={Calendar}
          color="text-purple-600"
          bg="bg-purple-50 dark:bg-purple-950/30"
        />
        <StatCard
          label="Pending Review"
          value={counts.submitted + counts.under_review}
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-50 dark:bg-amberth-950/30"
        />
        <StatCard
          label="Avg AI Score"
          value={aiScores.length ? `${avgAiScore}%` : "—"}
          sub={`${aiScores.length} evaluated`}
          icon={Zap}
          color="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-950/30"
        />
        <StatCard
          label="Avg Days to Hire"
          value={daysToHire.length ? `${avgDays}d` : "—"}
          sub={`${daysToHire.length} hires tracked`}
          icon={Target}
          color="text-rose-600"
          bg="bg-rose-50 dark:bg-rose-950/30"
        />
      </div>

      {/* Row 2: Funnel + Monthly trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline funnel */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-base font-semibold mb-5">Referral Pipeline</h2>
          <div className="space-y-4">
            {[
              {
                label: "Submitted",
                count: counts.submitted,
                color: "bg-blue-400",
              },
              {
                label: "Under Review",
                count: counts.under_review,
                color: "bg-amber-400",
              },
              {
                label: "Interview",
                count: counts.interview,
                color: "bg-purple-500",
              },
              { label: "Hired", count: counts.hired, color: "bg-emerald-500" },
              {
                label: "Rejected",
                count: counts.rejected,
                color: "bg-red-400",
              },
            ].map((item, i) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {item.count}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                      {counts.total
                        ? Math.round((item.count / counts.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <Bar
                  pct={counts.total ? (item.count / counts.total) * 100 : 0}
                  color={item.color}
                  delay={i * 0.08}
                />
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>Total in period: {counts.total}</span>
            <span className="font-semibold text-emerald-600">
              {conversionRate}% hire rate
            </span>
          </div>
        </div>

        {/* Monthly trend */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold">Monthly Trend</h2>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />{" "}
                Referrals
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />{" "}
                Hired
              </span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {monthlyTrend.map((m, i) => (
              <div
                key={m.label}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="w-full flex gap-0.5 items-end h-40">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.submitted / maxMonthly) * 100}%` }}
                    transition={{ delay: i * 0.07, duration: 0.5 }}
                    className="flex-1 bg-primary/80 rounded-t min-h-0.5"
                    title={`${m.submitted} referrals`}
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.hired / maxMonthly) * 100}%` }}
                    transition={{ delay: i * 0.07 + 0.05, duration: 0.5 }}
                    className="flex-1 bg-emerald-500 rounded-t min-h-0.5"
                    title={`${m.hired} hired`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
          {monthlyTrend.every((m) => m.submitted === 0) && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              No data in selected range
            </p>
          )}
        </div>
      </div>

      {/* Row 3: AI score distribution + Relationship breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Score distribution */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-base font-semibold mb-1">
            AI Score Distribution
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            {aiScores.length} candidates evaluated
          </p>
          {aiScores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Zap size={28} className="opacity-30" />
              <p className="text-sm">No AI evaluations yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scoreBuckets.map((b, i) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{b.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {b.count}
                    </span>
                  </div>
                  <Bar
                    pct={
                      aiScores.length ? (b.count / aiScores.length) * 100 : 0
                    }
                    color={b.color}
                    delay={i * 0.1}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Relationship breakdown */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-base font-semibold mb-1">
            Referral Relationship
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            How candidates are connected to referrers
          </p>
          {relMap.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              No data
            </p>
          ) : (
            <div className="space-y-4">
              {relMap.map((item, i) => {
                const label: Record<string, string> = {
                  friend: "Friend",
                  former_colleague: "Ex-Colleague",
                  family: "Family",
                  acquaintance: "Acquaintance",
                  other: "Other",
                };
                const colors = [
                  "bg-sky-400",
                  "bg-violet-400",
                  "bg-rose-400",
                  "bg-orange-400",
                  "bg-gray-400",
                ];
                return (
                  <div key={item.rel}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">
                        {label[item.rel] ?? item.rel}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.count} (
                        {counts.total
                          ? Math.round((item.count / counts.total) * 100)
                          : 0}
                        %)
                      </span>
                    </div>
                    <Bar
                      pct={counts.total ? (item.count / counts.total) * 100 : 0}
                      color={colors[i % colors.length]}
                      delay={i * 0.08}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Per-job performance table */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-base font-semibold mb-5">Referrals by Position</h2>
        {jobStats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No referrals in this period
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Position
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Referrals
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hired
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rejected
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hire Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobStats.map((j) => {
                  const rate = j.total
                    ? Math.round((j.hired / j.total) * 100)
                    : 0;
                  return (
                    <tr
                      key={j.title}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {j.title}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 text-xs font-semibold">
                          {j.total}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-xs font-semibold">
                          {j.hired}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 dark:bg-red-950 text-red-700 text-xs font-semibold">
                          {j.rejected}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${rate >= 30 ? "bg-emerald-500" : rate >= 10 ? "bg-amber-400" : "bg-red-400"}`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Row 5: Referrer leaderboard + Job board summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referrer leaderboard */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-base font-semibold mb-5">Top Referrers</h2>
          {referrerMap.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No data
            </p>
          ) : (
            <div className="space-y-3">
              {referrerMap.slice(0, 8).map((r, i) => (
                <div key={r.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {r.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.total} referrals
                      {r.avgScore > 0 && ` · avg AI ${r.avgScore}%`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.hired > 0 && (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                        {r.hired} hired
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {r.total ? Math.round((r.hired / r.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job board summary */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-base font-semibold mb-5">Job Board Summary</h2>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="p-3 bg-muted/40 rounded-xl text-center">
              <p className="text-2xl font-bold text-primary">{jobs.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Jobs</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {activeJobs.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Active</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl text-center">
              <p className="text-2xl font-bold text-red-500">
                {closedJobs.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Closed</p>
            </div>
          </div>
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {jobs.slice(0, 10).map((j) => {
              const refCount = filtered.filter(
                (r) => r.job._id === j._id,
              ).length;
              const isActive = j.status === "published" || (j as Job).isActive;
              return (
                <div key={j._id} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{j.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {j.location ?? "—"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded-full shrink-0">
                    {refCount} ref
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center pb-2">
        All data is live from your referral and job APIs · Last updated just now
      </p>
    </div>
  );
}
