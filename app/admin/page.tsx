import {
  Users,
  Bell,
  Zap,
  ArrowUpRight,
  Flag,
  LifeBuoy,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats, getRecentUsers } from "@/features/admin/services/admin-dashboard.service";
import { getSystemSettings } from "@/features/admin/services/admin-system.service";
import { AdminStatCard } from "@/features/admin/components/admin-stat-card";
import { StatusBadge } from "@/features/admin/components/status-badge";
import {
  AdminStagger,
  AdminMotionItem,
} from "@/features/admin/components/admin-motion-wrapper";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours.toLocaleString()}h ${minutes}m`;
  return `${minutes}m`;
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default async function AdminDashboardPage() {
  const [stats, recentUsers, systemSettings] = await Promise.all([
    getDashboardStats(),
    getRecentUsers(8),
    getSystemSettings(),
  ]);

  const maintenanceStatus = systemSettings.maintenance.enabled ? "maintenance" : "online";

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header with entrance animation */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-sm text-zinc-400 mt-1">Platform metrics, real-time activity, and operations</p>
        </div>
        <StatusBadge status={maintenanceStatus} size="lg" />
      </div>

      {/* Stats Grid with subtle cascade stagger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          index={0}
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon="users"
          trend={{
            value: stats.newUsersLast7Days,
            label: "this week",
          }}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <AdminStatCard
          index={1}
          title="Active Users (7d)"
          value={stats.activeUsersLast7Days.toLocaleString()}
          icon="activity"
          subtitle={`${stats.totalUsers > 0 ? Math.round((stats.activeUsersLast7Days / stats.totalUsers) * 100) : 0}% of total`}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <AdminStatCard
          index={2}
          title="Study Sessions"
          value={stats.totalStudySessions.toLocaleString()}
          icon="clock"
          subtitle={formatDuration(stats.totalStudyTimeSeconds) + " total"}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/10"
        />
        <AdminStatCard
          index={3}
          title="Topics Mastered"
          value={stats.totalTopicsMastered.toLocaleString()}
          icon="book-open"
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Quick Actions + System Status + Recent Users Grid */}
      <AdminStagger className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <AdminMotionItem variant="card">
          <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c]/70 p-5 space-y-4 hover:border-white/[0.1] transition-colors duration-200">
            <h2 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Quick Actions</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Control</span>
            </h2>
            <div className="space-y-1.5">
              <Link
                href="/admin/users"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04] transition-all duration-200 group"
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  Manage Users
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
              <Link
                href="/admin/notifications"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04] transition-all duration-200 group"
              >
                <span className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                  Send Notification
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
              <Link
                href="/admin/reports"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04] transition-all duration-200 group"
              >
                <span className="flex items-center gap-2.5">
                  <Flag className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 transition-colors" />
                  Chat Moderation
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
              <Link
                href="/admin/support"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04] transition-all duration-200 group"
              >
                <span className="flex items-center gap-2.5">
                  <LifeBuoy className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                  Support Desk
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
              <Link
                href="/admin/system"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04] transition-all duration-200 group"
              >
                <span className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                  System Controls
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </AdminMotionItem>

        {/* System Status */}
        <AdminMotionItem variant="card">
          <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c]/70 p-5 space-y-4 hover:border-white/[0.1] transition-colors duration-200">
            <h2 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Platform Health</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Telemetry</span>
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <span className="text-sm text-zinc-400">Application Status</span>
                <StatusBadge status={maintenanceStatus} size="sm" />
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <span className="text-sm text-zinc-400">Total Notifications</span>
                <span className="text-sm font-mono text-zinc-200">{stats.totalNotifications}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <span className="text-sm text-zinc-400">New Users (30d)</span>
                <span className="text-sm font-mono text-zinc-200">+{stats.newUsersLast30Days}</span>
              </div>
              {systemSettings.maintenance.enabled && systemSettings.maintenance.expected_return_time && (
                <div className="pt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-300 font-mono">
                    Expected return: {systemSettings.maintenance.expected_return_time}
                  </p>
                </div>
              )}
            </div>
          </div>
        </AdminMotionItem>

        {/* Recent Users */}
        <AdminMotionItem variant="card">
          <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0c]/70 p-5 space-y-4 hover:border-white/[0.1] transition-colors duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Recent Registrations</h2>
              <Link
                href="/admin/users"
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-medium"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-1.5">
              {recentUsers.slice(0, 5).map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="group flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-white/[0.035] transition-all duration-200 border border-transparent hover:border-white/[0.04]"
                >
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 group-hover:border-amber-500/30">
                    <span className="text-[10px] font-medium text-zinc-300">
                      {(user.full_name || user.email)?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-200 truncate font-medium group-hover:text-amber-300 transition-colors">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">{formatTimeAgo(user.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </AdminMotionItem>
      </AdminStagger>
    </div>
  );
}
