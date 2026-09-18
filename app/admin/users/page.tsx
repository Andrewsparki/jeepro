"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";

interface UserItem {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  target_exam: string | null;
  is_admin: boolean;
  created_at: string;
  study_sessions_count: number;
  topics_mastered_count: number;
}

interface UsersResponse {
  users: UserItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async (p: number, s: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        pageSize: "20",
      });
      if (s.trim()) params.set("search", s.trim());

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const result: UsersResponse = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(page, search);
    }, 0);
    return () => clearTimeout(timer);
  }, [page, search, fetchUsers]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const columns = [
    {
      key: "user",
      label: "Student Profile",
      render: (item: UserItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-zinc-300">
              {(item.full_name || item.email)?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {item.full_name || "Anonymous Student"}
            </p>
            <p className="text-xs text-zinc-500 truncate">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "target_exam",
      label: "Target",
      render: (item: UserItem) => (
        <span className="text-xs text-zinc-400 font-medium">
          {item.target_exam || "—"}
        </span>
      ),
    },
    {
      key: "study_sessions_count",
      label: "Sessions",
      render: (item: UserItem) => (
        <span className="text-sm text-zinc-200 tabular-nums font-mono">
          {item.study_sessions_count}
        </span>
      ),
    },
    {
      key: "topics_mastered_count",
      label: "Mastered",
      render: (item: UserItem) => (
        <span className="text-sm text-zinc-200 tabular-nums font-mono">
          {item.topics_mastered_count}
        </span>
      ),
    },
    {
      key: "is_admin",
      label: "Permissions",
      render: (item: UserItem) => (
        <span
          className={
            item.is_admin
              ? "px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono"
              : "px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-zinc-400 border border-white/[0.06]"
          }
        >
          {item.is_admin ? "Administrator" : "Student"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Enrolled",
      render: (item: UserItem) => (
        <span className="text-xs text-zinc-500 tabular-nums font-mono">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Student Accounts</h1>
            {data && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-zinc-300 font-mono">
                {data.total} Registered
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Search, inspect analytics, and audit individual student learning progress
          </p>
        </div>
      </div>

      <AdminDataTable<UserItem>
        columns={columns}
        data={data?.users || []}
        total={data?.total || 0}
        page={data?.page || 1}
        pageSize={data?.pageSize || 20}
        totalPages={data?.totalPages || 0}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder="Filter by student name or email..."
        isLoading={isLoading}
        onRowClick={(item) => router.push(`/admin/users/${item.id}`)}
        keyExtractor={(item) => item.id}
        emptyMessage="No matching student accounts found."
      />
    </div>
  );
}
