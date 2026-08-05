"use client";

import { 
  Search, 
  Filter, 
  SortDesc, 
  Download, 
  Trash2, 
  XCircle,
  FileJson,
  FileSpreadsheet
} from "lucide-react";
import { Subject } from "@/features/syllabus/services/syllabus";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export type SortOption = "newest" | "oldest" | "longest" | "shortest";

interface HistoryToolbarProps {
  syllabus: Subject[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  timeFilter: string;
  onTimeFilterChange: (t: string) => void;
  subjectFilter: string;
  onSubjectFilterChange: (s: string) => void;
  sortOption: SortOption;
  onSortChange: (s: SortOption) => void;
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onClearHistory: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export function HistoryToolbar({
  syllabus,
  searchQuery,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  subjectFilter,
  onSubjectFilterChange,
  sortOption,
  onSortChange,
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  onClearHistory,
  onExportCSV,
  onExportJSON
}: HistoryToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      
      {/* Top row: Search and basic filters */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <motion.div 
          className="relative flex-1 w-full group"
          initial={false}
          animate={{
            scale: searchQuery ? 1.01 : 1,
            boxShadow: searchQuery ? "0 4px 20px rgba(var(--accent-rgb),0.1)" : "0 0 0 rgba(0,0,0,0)"
          }}
          transition={{ duration: 0.3 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search by chapter, subject, or activity..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm transition-all duration-300 shadow-inner group-focus-within:bg-accent/[0.03]"
          />
        </motion.div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          <div className="relative group shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            <select 
              className="appearance-none pl-9 pr-8 py-2.5 bg-card border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer hover:border-accent/30 transition-colors"
              value={timeFilter}
              onChange={(e) => onTimeFilterChange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          <div className="relative shrink-0 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            <select 
              className="appearance-none pl-9 pr-8 py-2.5 bg-card border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer hover:border-accent/30 transition-colors"
              value={subjectFilter}
              onChange={(e) => onSubjectFilterChange(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {syllabus.map(sub => (
                <option key={sub.id} value={sub.name}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className="relative shrink-0 group">
            <SortDesc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            <select 
              className="appearance-none pl-9 pr-8 py-2.5 bg-card border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer hover:border-accent/30 transition-colors"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="longest">Longest Duration</option>
              <option value="shortest">Shortest Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Row - Animated presence based on selection */}
      <AnimatePresence>
        {selectedCount > 0 ? (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl bg-accent/10 border border-accent/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-accent px-2">
                {selectedCount} selected
              </span>
              <button 
                onClick={onClearSelection}
                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onDeleteSelected}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4" /> Delete Selected
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-end gap-2"
          >
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-card border border-border/50 hover:bg-accent hover:text-white rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4" /> Export
              </button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-40 bg-card border border-border/50 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => { onExportCSV(); setShowExportMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-500" /> CSV
                    </button>
                    <button
                      onClick={() => { onExportJSON(); setShowExportMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left"
                    >
                      <FileJson className="w-4 h-4 text-yellow-500" /> JSON
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              onClick={onClearHistory}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors font-medium ml-2"
            >
              <Trash2 className="w-4 h-4" /> Clear History
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
