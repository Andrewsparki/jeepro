"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";

interface Column<T> {
  key: string;
  label: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function AdminDataTable<T>({
  columns,
  data,
  total,
  page,
  totalPages,
  onPageChange,
  onSearch,
  searchPlaceholder = "Search...",
  isLoading,
  onRowClick,
  keyExtractor,
  emptyMessage = "No results found.",
}: AdminDataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch?.(value);
      }, 400);
    },
    [onSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Search */}
      {onSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-colors"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider",
                      col.className
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5">
                        <div className="h-4 w-24 bg-white/[0.04] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-zinc-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "transition-colors",
                      onRowClick
                        ? "cursor-pointer hover:bg-white/[0.03]"
                        : ""
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-4 py-3.5 text-sm text-zinc-300", col.className)}>
                        {col.render
                          ? col.render(item)
                          : String((item as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
            <p className="text-xs text-zinc-500">
              Showing {data.length} of {total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-400 min-w-[60px] text-center">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
