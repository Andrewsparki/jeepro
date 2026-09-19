"use client";

import { MobileNav } from "./mobile-nav";
import { Search } from "lucide-react";
import { NotificationCenter } from "@/features/notifications/components/notification-center";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useCommandPalette } from "@/features/search/context/command-palette-context";
import { useFocusStore } from "@/features/focus/store/focus-store";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface TopbarProps {
  title?: string;
  greeting?: string;
}

export function Topbar({ title, greeting = "Good morning" }: TopbarProps) {
  const { profile, user } = useAuth();
  const { setIsOpen } = useCommandPalette();
  const pathname = usePathname();
  const { isImmersive } = useFocusStore();
  
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
          <div className="hidden md:block">
            <h1 className="text-sm font-medium text-muted-foreground">
              {greeting}, <span className="text-foreground font-semibold">{displayName}</span>
            </h1>
          </div>
          {title && (
            <div className="md:hidden">
              <h1 className="text-sm font-semibold">{title}</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
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
