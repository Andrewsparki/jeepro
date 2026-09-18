"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ADMIN_EASE_FLUID } from "./motion";
import { playHapticSound } from "@/lib/sound-effects";

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
  const shouldReduceMotion = useReducedMotion();

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
      {/* Search Input with Focus Ring Transition */}
      {onSearch && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-amber-500/10 transition-all duration-200"
          />
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d]/80 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider",
                      col.className
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <AnimatePresence mode="wait" initial={false}>
              <tbody key={`page-${page}-${isLoading}`} className="divide-y divide-white/[0.04]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3.5">
                          <div className="h-4 w-24 bg-white/[0.04] rounded-md animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-zinc-400">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => {
                    const rowKey = keyExtractor(item);

                    if (shouldReduceMotion) {
                      return (
                        <tr
                          key={rowKey}
                          onClick={() => onRowClick?.(item)}
                          className={cn(
                            "transition-colors duration-150",
                            onRowClick
                              ? "cursor-pointer hover:bg-white/[0.04] active:bg-white/[0.06]"
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
                      );
                    }

                    return (
                      <motion.tr
                        key={rowKey}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: Math.min(idx * 0.02, 0.25),
                          ease: ADMIN_EASE_FLUID,
                        }}
                        onClick={() => {
                          if (onRowClick) {
                            playHapticSound("soft-tap");
                            onRowClick(item);
                          }
                        }}
                        className={cn(
                          "transition-colors duration-150",
                          onRowClick
                            ? "cursor-pointer hover:bg-white/[0.035] active:bg-white/[0.06]"
                            : "hover:bg-white/[0.015]"
                        )}
                      >
                        {columns.map((col) => (
                          <td key={col.key} className={cn("px-4 py-3.5 text-sm text-zinc-300", col.className)}>
                            {col.render
                              ? col.render(item)
                              : String((item as Record<string, unknown>)[col.key] ?? "")}
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </AnimatePresence>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
            <p className="text-xs text-zinc-400">
              Showing <span className="text-white font-medium">{data.length}</span> of{" "}
              <span className="text-white font-medium">{total}</span> results
            </p>
            <div className="flex items-center gap-2 select-none">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  playHapticSound("click");
                  onPageChange(page - 1);
                }}
                disabled={page <= 1}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <span className="text-xs text-zinc-400 min-w-[60px] text-center font-mono">
                {page} / {totalPages}
              </span>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  playHapticSound("click");
                  onPageChange(page + 1);
                }}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
