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
      label: "User",
      render: (item: UserItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-zinc-400">
              {(item.full_name || item.email)?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-zinc-200 truncate">
              {item.full_name || "—"}
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
        <span className="text-xs text-zinc-400">
          {item.target_exam || "—"}
        </span>
      ),
    },
    {
      key: "study_sessions_count",
      label: "Sessions",
      render: (item: UserItem) => (
        <span className="text-sm text-zinc-300 tabular-nums">
          {item.study_sessions_count}
        </span>
      ),
    },
    {
      key: "topics_mastered_count",
      label: "Mastered",
      render: (item: UserItem) => (
        <span className="text-sm text-zinc-300 tabular-nums">
          {item.topics_mastered_count}
        </span>
      ),
    },
    {
      key: "is_admin",
      label: "Role",
      render: (item: UserItem) => (
        <span className={item.is_admin ? "text-xs font-medium text-amber-400" : "text-xs text-zinc-500"}>
          {item.is_admin ? "Admin" : "Student"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      render: (item: UserItem) => (
        <span className="text-xs text-zinc-500 tabular-nums">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage and inspect registered users
        </p>
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
        searchPlaceholder="Search by name or email..."
        isLoading={isLoading}
        onRowClick={(item) => router.push(`/admin/users/${item.id}`)}
        keyExtractor={(item) => item.id}
        emptyMessage="No users found."
      />
    </div>
  );
}
