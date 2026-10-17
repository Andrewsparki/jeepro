"use client";

import { MobileNav } from "./mobile-nav";
import { Search } from "lucide-react";
import { NotificationCenter } from "@/features/notifications/components/notification-center";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useCommandPalette } from "@/features/search/context/command-palette-context";
import { useFocusStore } from "@/features/focus/store/focus-store";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { useBirthdayMode } from "@/features/birthday/context/birthday-mode-context";
import { useAiAssistant } from "@/features/ai-assistant/context/ai-assistant-context";
import { Sparkles, Gift } from "lucide-react";

interface TopbarProps {
  title?: string;
  greeting?: string;
}

export function Topbar({ title, greeting = "Good morning" }: TopbarProps) {
  const { profile, user } = useAuth();
  const { setIsOpen } = useCommandPalette();
  const { setIsOpen: setIsAiOpen } = useAiAssistant();
  const pathname = usePathname();
  const { isImmersive } = useFocusStore();
  const { isBirthdayModeActive, isBirthdayToday, openRecapModal } = useBirthdayMode();
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const initials = displayName.substring(0, 1).toUpperCase();

  const isHidden = pathname === "/dashboard/focus" && isImmersive;

  return (
    <motion.header 
      initial={false}
      animate={{
        height: isHidden ? 0 : 64,
        y: isHidden ? -64 : 0,
        opacity: isHidden ? 0 : 1,
        borderBottomWidth: isHidden ? 0 : 1,
      }}
      transition={{
        duration: 0.28,
        ease: [0.32, 0.72, 0, 1]
      }}
      style={{
        pointerEvents: isHidden ? "none" : "auto",
      }}
      className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border/40 bg-background/80 px-4 md:px-6 lg:px-8 backdrop-blur-md shadow-xs overflow-hidden shrink-0"
    >
      <div className="w-full flex items-center justify-between gap-4 h-16 shrink-0">
        <div className="flex items-center gap-4">
          <MobileNav />
          <div className="hidden md:flex items-center gap-3">
            <h1 className="text-sm font-medium text-muted-foreground">
              {greeting}, <span className="text-foreground font-semibold">{displayName}</span>
            </h1>
            {(isBirthdayModeActive || isBirthdayToday) && (
              <button
                onClick={openRecapModal}
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-emerald-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Replay Your Birthday Year Recap"
              >
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                <span>Birthday Scholar 🎂</span>
              </button>
            )}
          </div>
          {title && (
            <div className="md:hidden">
              <h1 className="text-sm font-semibold">{title}</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(isBirthdayModeActive || isBirthdayToday) && (
            <button
              onClick={openRecapModal}
              className="md:hidden flex items-center justify-center p-2 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30"
              title="Birthday Recap"
            >
              <Gift className="w-4 h-4 text-amber-400" />
            </button>
          )}
          <Button
            variant="ghost"
            className="text-muted-foreground hover:bg-accent/15 hover:text-[#78A9FF] flex items-center gap-2 rounded-full px-3 text-xs font-medium border border-border/40 bg-background/50 hover:border-[#78A9FF]/30 transition-colors"
            onClick={() => setIsAiOpen(true)}
            title="Open JEE Pro AI Study Assistant"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#78A9FF]" />
            <span className="hidden sm:inline">AI Tutor</span>
          </Button>

          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:bg-muted/50 hover:text-foreground hidden sm:flex items-center gap-2 rounded-full px-4"
            onClick={() => setIsOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Search</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground sm:hidden"
            onClick={() => setIsOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
          <NotificationCenter />
          <div className="md:hidden ml-2 h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent font-semibold text-xs uppercase">
            {initials}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
