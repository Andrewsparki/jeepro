"use client";

import { useEffect, useState, useCallback } from "react";
import type { UserRole } from "@/features/admin/types/roles.types";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserRoleItem {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_admin: boolean;
  created_at: string;
}

interface RolesResponse {
  users: UserRoleItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  roleCounts: Record<UserRole, number>;
}

type RoleIconComponent = React.ComponentType<{ className?: string }>;

const ROLE_DEFINITIONS: Record<
  UserRole,
  { label: string; badgeClass: string; icon: RoleIconComponent; description: string; permissions: string[] }
> = {
  superadmin: {
    label: "Superadmin / Owner",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: ShieldAlert,
    description: "Highest tier system authority. Exclusive permission to manage roles, grant/revoke privileges, and manage security settings.",
    permissions: [
      "Assign and revoke platform roles",
      "Full administrative tool access",
      "View and clear security audit logs",
      "System maintenance mode control",
    ],
  },
  admin: {
    label: "Administrator",
    badgeClass: "bg-[#78A9FF]/15 text-[#78A9FF] border-[#78A9FF]/30",
    icon: ShieldCheck,
    description: "Operational administrator. Manages user accounts, platform content, system notifications, and views telemetry.",
    permissions: [
      "Access Admin Control Center",
      "Manage student accounts & status",
      "Publish system notifications & updates",
      "View private developer analytics",
    ],
  },
  moderator: {
    label: "Moderator",
    badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    icon: Shield,
    description: "Community safety team. Inspects reported messages and applies chat restrictions in social spaces.",
    permissions: [
      "Access chat moderation queue",
      "Mute and ban users from Global Chat",
      "Review flagged user reports",
      "Moderate study group discussions",
    ],
  },
  user: {
    label: "Standard Student",
    badgeClass: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
    icon: UserCheck,
    description: "Standard student access to JEE Pro's study engine, planner, focus timer, and community features.",
    permissions: [
      "Syllabus & chapter study workspace",
      "Daily missions, practice, & tests",
      "Focus timer & personal analytics",
      "Participate in global chat & study groups",
    ],
  },
};

export default function AdminRolesPage() {
  const [data, setData] = useState<RolesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Modal State
  const [selectedUser, setSelectedUser] = useState<UserRoleItem | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>("user");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchRoles = useCallback(async (p: number, s: string, r: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        pageSize: "20",
      });
      if (s.trim()) params.set("search", s.trim());
      if (r !== "all") params.set("role", r);

      const res = await fetch(`/api/admin/roles?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else if (res.status === 403) {
        setFeedback({
          type: "error",
          text: "Access Denied: Only Superadmins / Application Owners can access Role Management.",
        });
      }
    } catch (err) {
      console.error("Failed to load roles:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchRoles(page, search, roleFilter);
    }, 0);
    return () => clearTimeout(timer);
  }, [page, search, roleFilter, fetchRoles]);

  const openRoleModal = (user: UserRoleItem) => {
    setSelectedUser(user);
    setTargetRole(user.role);
    setReason("");
    setFeedback(null);
  };

  const closeRoleModal = () => {
    setSelectedUser(null);
    setReason("");
  };

  const handleRoleSubmit = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          newRole: targetRole,
          reason: reason.trim() || undefined,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setFeedback({ type: "success", text: result.message || "Role updated successfully." });
        setTimeout(() => {
          closeRoleModal();
          void fetchRoles(page, search, roleFilter);
        }, 1200);
      } else {
        setFeedback({ type: "error", text: result.error || "Failed to update role." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setFeedback({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Role & Privilege Management</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase font-bold">
              Superadmin Only
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Assign and revoke administrative, moderation, and standard student roles with mandatory security audit logging.
          </p>
        </div>

        <button
          onClick={() => fetchRoles(page, search, roleFilter)}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Role Distribution KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Superadmins / Owners</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-300">
            {data?.roleCounts?.superadmin ?? "—"}
          </div>
          <p className="text-[11px] text-zinc-400">Exclusive role authority</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Administrators</span>
            <ShieldCheck className="w-4 h-4 text-[#78A9FF]" />
          </div>
          <div className="text-3xl font-extrabold text-[#78A9FF]">
            {data?.roleCounts?.admin ?? "—"}
          </div>
          <p className="text-[11px] text-zinc-400">Operations & platform tools</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Moderators</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-300">
            {data?.roleCounts?.moderator ?? "—"}
          </div>
          <p className="text-[11px] text-zinc-400">Chat & community safety</p>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#121212] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Standard Students</span>
            <UserCheck className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {data?.roleCounts?.user ?? "—"}
          </div>
          <p className="text-[11px] text-zinc-400">Active learners</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-white/[0.08] bg-[#121212]">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#78A9FF]/40 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1" />
          {(
            [
              { id: "all", label: "All Roles" },
              { id: "superadmin", label: "Superadmins" },
              { id: "admin", label: "Admins" },
              { id: "moderator", label: "Moderators" },
              { id: "user", label: "Students" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setRoleFilter(filter.id)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-lg transition-all shrink-0 cursor-pointer font-medium",
                roleFilter === filter.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users & Roles Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121212] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 font-mono text-[10px] uppercase">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Permission Scope</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {data?.users && data.users.length > 0 ? (
                data.users.map((u) => {
                  const roleConfig = ROLE_DEFINITIONS[u.role] || ROLE_DEFINITIONS.user;
                  const Icon = roleConfig.icon;

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center font-bold text-xs text-white shrink-0 overflow-hidden">
                            {u.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (u.full_name || u.email).slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate text-xs">
                              {u.full_name || "Anonymous Student"}
                            </p>
                            <p className="font-mono text-zinc-400 text-[11px] truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                            roleConfig.badgeClass
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{roleConfig.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-zinc-300 text-xs line-clamp-1 max-w-sm">
                          {roleConfig.description}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openRoleModal(u)}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <span>Manage Role</span>
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400 text-xs">
                    {isLoading ? "Loading user roles..." : "No users matched the criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/[0.06] text-xs text-zinc-400">
            <span>
              Showing {data.users.length} of {data.total} users
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.08] text-zinc-200 cursor-pointer"
              >
                Previous
              </button>
              <span className="font-mono text-zinc-300">
                {page} / {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                className="px-3 py-1 rounded-lg bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.08] text-zinc-200 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Assignment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#121212] p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Assign Security Role</h3>
                  <p className="text-xs text-zinc-400">
                    Modifying authorization for{" "}
                    <span className="text-white font-medium">{selectedUser.full_name || selectedUser.email}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={closeRoleModal}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Role Options */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-zinc-300 block">Select Target Role</label>
              {(
                [
                  { id: "user", label: "User (Standard Student)" },
                  { id: "moderator", label: "Moderator" },
                  { id: "admin", label: "Administrator" },
                  { id: "superadmin", label: "Superadmin / Owner" },
                ] as const
              ).map((opt) => {
                const config = ROLE_DEFINITIONS[opt.id];
                const Icon = config.icon;
                const isSelected = targetRole === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => setTargetRole(opt.id)}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3",
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.06)]"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                        isSelected
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-bold", isSelected ? "text-amber-300" : "text-zinc-200")}>
                          {config.label}
                        </span>
                        {selectedUser.role === opt.id && (
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">Current</span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Justification / Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Audit Reason / Justification <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Promoted to community moderator after interview"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/40 transition-colors"
              />
              <p className="text-[10px] text-zinc-500">
                This action is permanently recorded in the immutable security audit log.
              </p>
            </div>

            {/* Warning when assigning elevated privileges */}
            {targetRole !== "user" && targetRole !== selectedUser.role && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  You are granting <span className="font-bold underline">{targetRole.toUpperCase()}</span> privileges.
                  This grants elevated administrative or moderation capabilities across the application.
                </p>
              </div>
            )}

            {/* Feedback alert */}
            {feedback && (
              <div
                className={cn(
                  "p-3 rounded-xl flex items-center gap-2 text-xs",
                  feedback.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                    : "bg-red-500/10 border border-red-500/20 text-red-300"
                )}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={closeRoleModal}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRoleSubmit}
                disabled={isSubmitting || targetRole === selectedUser.role}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Applying Changes...</span>
                  </>
                ) : (
                  <span>Confirm Role Assignment</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
