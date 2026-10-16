"use client";

import { useEffect, useState, useCallback } from "react";
import { AnalyticsSummary } from "@/features/analytics/types/analytics.types";
import {
  Users,
  Eye,
  TrendingUp,
  Monitor,
  Smartphone,
  Clock,
  RefreshCw,
  Globe,
  Hourglass,
  Layers,
  Calendar,
  Filter,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0s";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

type TimeRange = "today" | "7d" | "30d" | "all";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const fetchStats = useCallback(async (range: TimeRange = timeRange) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/track?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchStats(timeRange);
    }, 0);
    return () => clearTimeout(timer);
  }, [timeRange, fetchStats]);

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Product Intelligence & Telemetry</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">
              Consented Only
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#78A9FF]/10 text-[#78A9FF] border border-[#78A9FF]/20 uppercase font-bold">
              Admin Routes Excluded
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Privacy-conscious visitor metrics, active engagement times, conversion funnels, and error telemetry without cross-site tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Time Range Selector */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            {(
              [
                { id: "today", label: "Today" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "all", label: "All Time" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setTimeRange(item.id)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer",
                  timeRange === item.id
                    ? "bg-[#78A9FF]/20 text-[#78A9FF] border border-[#78A9FF]/30 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats(timeRange)}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Page Views */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Page Views</span>
            <Eye className="w-4 h-4 text-[#78A9FF]" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {data?.totalPageViews.toLocaleString() ?? "—"}
          </div>
          <p className="text-[11px] text-zinc-400">Excludes all administrative activity</p>
        </div>

        {/* Approx. Active Sessions */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Approx. Active Sessions</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {data?.activeSessions?.toLocaleString() ?? "—"}
          </div>
          <p className="text-[11px] text-zinc-400">Unique browser profiles active in last 5m</p>
        </div>

        {/* Total Active Engagement Time */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Active Engagement Time</span>
            <Hourglass className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {data?.totalEngagementSeconds !== undefined ? formatDuration(data.totalEngagementSeconds) : "—"}
          </div>
          <p className="text-[11px] text-zinc-400">Idle & hidden tab time paused</p>
        </div>

        {/* Avg. Time Per Visit */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Avg. Time per Visit</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {data?.avgEngagementSecondsPerVisit !== undefined
              ? formatDuration(data.avgEngagementSecondsPerVisit)
              : "—"}
          </div>
          <p className="text-[11px] text-zinc-400">Active interaction per route session</p>
        </div>
      </div>

      {/* Funnels & Conversion Drop-off Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding & Conversion Funnel */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#78A9FF]" />
              <span>Onboarding & Conversion Funnel</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">Visitor Journey</span>
          </div>
          <p className="text-xs text-zinc-400">
            Conversion drop-offs from public landing through authentication into the student workspace.
          </p>

          <div className="space-y-3 pt-2">
            {data?.onboardingFunnel && data.onboardingFunnel.length > 0 ? (
              data.onboardingFunnel.map((step, idx) => {
                const maxCount = data.onboardingFunnel[0].count || 1;
                const pctOfTop = Math.round((step.count / maxCount) * 100);
                return (
                  <div key={step.name} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center font-mono text-[10px] text-zinc-300">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white">{step.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-bold">{step.count} hits</span>
                        {idx > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" />
                            {step.dropoffRate}% drop
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#78A9FF] to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(4, pctOfTop)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-zinc-400 py-6 text-center">No funnel metrics recorded yet.</p>
            )}
          </div>
        </div>

        {/* Study Workflow Funnel */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Study Workflow Funnel</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">Session Completion</span>
          </div>
          <p className="text-xs text-zinc-400">
            Path tracking from workspace entry to active study session initiation and completion.
          </p>

          <div className="space-y-3 pt-2">
            {data?.studyWorkflowFunnel && data.studyWorkflowFunnel.length > 0 ? (
              data.studyWorkflowFunnel.map((step, idx) => {
                const maxCount = data.studyWorkflowFunnel[0].count || 1;
                const pctOfTop = Math.round((step.count / maxCount) * 100);
                return (
                  <div key={step.name} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center font-mono text-[10px] text-zinc-300">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white">{step.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-bold">{step.count} events</span>
                        {idx > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" />
                            {step.dropoffRate}% drop
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(4, pctOfTop)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-zinc-400 py-6 text-center">No study workflow metrics logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Route Active Engagement Breakdown */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#78A9FF]" />
              <span>Route Engagement & Time Spent</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">Ranked by Total Active Time</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-zinc-400 font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Route / Path</th>
                  <th className="py-2.5 px-3">Feature Category</th>
                  <th className="py-2.5 px-3">Total Time</th>
                  <th className="py-2.5 px-3">Avg Time / Visit</th>
                  <th className="py-2.5 px-3 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data?.routeEngagement && data.routeEngagement.length > 0 ? (
                  data.routeEngagement.map((r) => (
                    <tr key={r.path} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-mono text-zinc-200">{r.path}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                          {r.feature}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#78A9FF] font-mono">
                        {formatDuration(r.totalSeconds)}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300 font-mono">
                        {formatDuration(r.avgSecondsPerVisit)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-zinc-400">
                        {r.visitCount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-400">
                      No route engagement recorded in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Major Feature Engagement Share */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Feature Time Share</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">% Active Time</span>
          </div>

          <div className="space-y-3.5">
            {data?.featureEngagement && data.featureEngagement.length > 0 ? (
              data.featureEngagement.slice(0, 7).map((f) => (
                <div key={f.feature} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-200 truncate pr-2">{f.feature}</span>
                    <span className="font-mono text-[#78A9FF] shrink-0 font-semibold">
                      {formatDuration(f.totalSeconds)} ({f.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#78A9FF] to-emerald-400 rounded-full"
                      style={{ width: `${Math.min(100, f.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 py-6 text-center">No feature engagement logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Cohort Retention & Daily Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Retention Cohorts Table */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Cohort Retention Matrix</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">Returning Visitor Rates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-white/[0.08] text-zinc-400 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Cohort</th>
                  <th className="py-2.5 px-3 text-center">Users</th>
                  <th className="py-2.5 px-2 text-center">D1</th>
                  <th className="py-2.5 px-2 text-center">D3</th>
                  <th className="py-2.5 px-2 text-center">D7</th>
                  <th className="py-2.5 px-2 text-center">D14</th>
                  <th className="py-2.5 px-2 text-center">D30</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data?.retentionCohorts && data.retentionCohorts.length > 0 ? (
                  data.retentionCohorts.map((c) => (
                    <tr key={c.cohortDate} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-semibold text-zinc-200">{c.cohortDate}</td>
                      <td className="py-2.5 px-3 text-center text-zinc-300 font-bold">{c.size}</td>
                      {c.retentionRates.map((rate, rIdx) => {
                        const intensity = rate >= 70 ? "bg-emerald-500/20 text-emerald-300" : rate >= 40 ? "bg-[#78A9FF]/20 text-[#78A9FF]" : "bg-white/[0.04] text-zinc-400";
                        return (
                          <td key={rIdx} className="py-2.5 px-2 text-center">
                            <span className={cn("px-2 py-0.5 rounded text-[11px] font-semibold", intensity)}>
                              {rate}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-zinc-400 font-sans">
                      No cohort data compiled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Engagement Trend */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Daily Active Trends</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">Date Aggregated</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
            {data?.engagementTrends && data.engagementTrends.length > 0 ? (
              data.engagementTrends.map((d) => (
                <div
                  key={d.date}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-3 text-xs"
                >
                  <span className="font-mono text-zinc-300 font-medium">{d.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {d.activeSessions} sessions
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-mono font-semibold text-[11px]">
                      {formatDuration(d.totalSeconds)} active
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 py-6 text-center">No activity recorded for this period.</p>
            )}
          </div>
        </div>
      </div>

      {/* Client-Side Error Telemetry & Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Error Telemetry */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Client-Side Error Telemetry</h3>
            </div>
            {data?.errorStats && data.errorStats.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
                {data.errorStats.length} Issues Logged
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Zero Errors
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-zinc-400 font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Error Preview</th>
                  <th className="py-2.5 px-3">Path</th>
                  <th className="py-2.5 px-3 text-center">Occurrences</th>
                  <th className="py-2.5 px-3 text-right">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data?.errorStats && data.errorStats.length > 0 ? (
                  data.errorStats.map((err, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-mono text-zinc-200 max-w-[260px] truncate">
                        {err.message}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-400 text-[11px]">{err.path}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-rose-400 font-bold">
                        {err.count}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-zinc-400 text-[11px]">
                        {new Date(err.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-400">
                      No client runtime errors captured in this window. Application is healthy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Platform Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Monitor className="w-4 h-4 text-emerald-400" />
              <span>Device Distribution</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">Hardware Profile</span>
          </div>

          <div className="space-y-3">
            {data?.deviceBreakdown && data.deviceBreakdown.length > 0 ? (
              data.deviceBreakdown.map((d) => (
                <div key={d.device} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize font-medium text-zinc-300 flex items-center gap-2">
                      {d.device === "mobile" ? (
                        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5 text-[#78A9FF]" />
                      )}
                      {d.device}
                    </span>
                    <span className="font-mono text-zinc-400">{d.count} hits</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-[#78A9FF]"
                      style={{
                        width: `${Math.min(100, (d.count / (data.totalPageViews || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 py-6 text-center">No client platform data recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Event Stream */}
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Recent Consented Events</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-400">Strictly Non-Admin</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 font-mono text-[10px] uppercase">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Route / Path</th>
                <th className="py-2.5 px-3">Feature</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-sans">
              {data?.recentEvents && data.recentEvents.length > 0 ? (
                data.recentEvents.slice(0, 15).map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#78A9FF]/10 text-[#78A9FF] border border-[#78A9FF]/20 font-semibold">
                        {e.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-200">{e.path}</td>
                    <td className="py-2.5 px-3 text-zinc-400 text-[11px]">{e.feature || "—"}</td>
                    <td className="py-2.5 px-3 text-zinc-400">
                      {e.browser} / {e.os}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400 text-[11px]">
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-zinc-400">
                    No recent events logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
