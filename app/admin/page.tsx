import {
  Users,
  Activity,
  Clock,
  BookOpen,
  Bell,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats, getRecentUsers } from "@/features/admin/services/admin-dashboard.service";
import { getSystemSettings } from "@/features/admin/services/admin-system.service";
import { AdminStatCard } from "@/features/admin/components/admin-stat-card";
import { StatusBadge } from "@/features/admin/components/status-badge";

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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Overview of your JEE Pro platform</p>
        </div>
        <StatusBadge status={maintenanceStatus} size="lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={{
            value: stats.newUsersLast7Days,
            label: "this week",
          }}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <AdminStatCard
          title="Active Users (7d)"
          value={stats.activeUsersLast7Days.toLocaleString()}
          icon={Activity}
          subtitle={`${stats.totalUsers > 0 ? Math.round((stats.activeUsersLast7Days / stats.totalUsers) * 100) : 0}% of total`}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <AdminStatCard
          title="Study Sessions"
          value={stats.totalStudySessions.toLocaleString()}
          icon={Clock}
          subtitle={formatDuration(stats.totalStudyTimeSeconds) + " total"}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/10"
        />
        <AdminStatCard
          title="Topics Mastered"
          value={stats.totalTopicsMastered.toLocaleString()}
          icon={BookOpen}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Quick Actions + Recent Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/users"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all group"
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                Manage Users
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/admin/notifications"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all group"
            >
              <span className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                Send Notification
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/admin/system"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all group"
            >
              <span className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                System Controls
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Website</span>
              <StatusBadge status={maintenanceStatus} size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Notifications</span>
              <span className="text-sm text-zinc-300">{stats.totalNotifications}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">New Users (30d)</span>
              <span className="text-sm text-zinc-300">{stats.newUsersLast30Days}</span>
            </div>
            {systemSettings.maintenance.enabled && systemSettings.maintenance.expected_return_time && (
              <div className="pt-2 border-t border-white/[0.06]">
                <p className="text-xs text-amber-400">
                  Expected return: {systemSettings.maintenance.expected_return_time}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Users</h2>
            <Link href="/admin/users" className="text-xs text-amber-500 hover:text-amber-400 transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentUsers.slice(0, 5).map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="flex items-center gap-3 px-2 py-1.5 -mx-2 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-medium text-zinc-400">
                    {(user.full_name || user.email)?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-zinc-300 truncate">
                    {user.full_name || user.email}
                  </p>
                  <p className="text-[10px] text-zinc-600 truncate">{formatTimeAgo(user.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
