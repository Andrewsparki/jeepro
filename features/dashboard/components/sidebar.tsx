"use client";

import { useState } from "react";
import Link from "next/link";
import { SidebarItem } from "./sidebar-item";
import { BrandLogo } from "./brand-logo";
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  LineChart, 
  Calendar, 
  Settings, 
  LogOut, 
  History, 
  Crosshair, 
  MessageSquare, 
  Users, 
  Trophy, 
  Award, 
  ChevronDown, 
  ChevronRight, 
  GraduationCap,
  LifeBuoy 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/components/auth-provider";
import { logout } from "@/features/auth/actions/auth";
import { useFocusStore } from "@/features/focus/store/focus-store";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useSettings } from "@/providers/settings-provider";
import { useDirectConversations } from "@/features/chat/hooks/use-direct-conversations";
import { useFriends } from "@/features/friends/hooks/use-friends";
import { WhatsNewTrigger } from "@/features/whats-new/components/whats-new-trigger";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/dashboard/focus", label: "Focus", icon: <Crosshair className="h-5 w-5" /> },
  { href: "/dashboard/study", label: "Study", icon: <BookOpen className="h-5 w-5" /> },
  { href: "/dashboard/syllabus", label: "Syllabus", icon: <Target className="h-5 w-5" /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <LineChart className="h-5 w-5" /> },
  { href: "/dashboard/planner", label: "Planner", icon: <Calendar className="h-5 w-5" /> },
  { href: "/dashboard/history", label: "History", icon: <History className="h-5 w-5" /> },
];

export function Sidebar() {
  const { profile, user } = useAuth();
  const pathname = usePathname();
  const { isImmersive } = useFocusStore();
  const { playSound } = useSettings();
  
  const [isSocialOpen, setIsSocialOpen] = useState(true);
  const { totalUnreadCount } = useDirectConversations();
  const { pendingReceived } = useFriends();
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const initials = displayName.substring(0, 1).toUpperCase();

  const isHidden = pathname === "/dashboard/focus" && isImmersive;

  const socialNav = [
    { href: "/dashboard/chat", label: "Global Chat", icon: <MessageSquare className="h-5 w-5" />, badge: totalUnreadCount },
    { href: "/dashboard/friends", label: "Friends", icon: <Users className="h-5 w-5" />, badge: pendingReceived?.length || 0 },
    { href: "/dashboard/groups", label: "Study Groups", icon: <GraduationCap className="h-5 w-5" /> },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: <Trophy className="h-5 w-5" /> },
    { href: "/dashboard/achievements", label: "Achievements", icon: <Award className="h-5 w-5" /> },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{
        width: isHidden ? 0 : 260,
        x: isHidden ? -260 : 0,
        opacity: isHidden ? 0 : 1,
        borderRightWidth: isHidden ? 0 : 1,
      }}
      transition={{
        duration: 0.28,
        ease: [0.32, 0.72, 0, 1]
      }}
      style={{
        pointerEvents: isHidden ? "none" : "auto",
      }}
      className="hidden flex-col border-r border-border/40 bg-secondary/95 dark:bg-background/95 md:flex sticky top-0 z-30 overflow-hidden whitespace-nowrap h-[100dvh] max-h-[100dvh] min-h-0 shrink-0"
    >
      <div className="w-[260px] h-full flex flex-col justify-between overflow-hidden shrink-0">
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/40 shrink-0">
          <Link href="/dashboard" className="outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md">
            <BrandLogo size="md" />
          </Link>
          <ThemeSwitcher className="shrink-0" />
        </div>

        <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto py-6 px-4 custom-scrollbar">
          <LayoutGroup id="sidebar-nav">
            <nav className="flex flex-col gap-1">
              {mainNav.map((item) => (
                <SidebarItem key={item.href} {...item} />
              ))}
            </nav>

            <div className="mt-6 mb-2">
              <button 
                onClick={() => {
                  setIsSocialOpen(!isSocialOpen);
                  playSound("liquid-glass");
                }}
                className="flex w-full items-center justify-between px-3 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              >
                SOCIAL
                {isSocialOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
              
              <AnimatePresence initial={false}>
                {isSocialOpen && (
                  <motion.nav 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex flex-col gap-1 mt-2 overflow-hidden"
                  >
                    {socialNav.map((item) => (
                      <SidebarItem key={item.href} {...item} />
                    ))}
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        </div>

        <div className="p-4 border-t border-border/40 flex flex-col gap-1 shrink-0 bg-secondary/95 dark:bg-background/95 relative z-10">
          <WhatsNewTrigger variant="sidebar" />
          <SidebarItem href="/dashboard/support" label="Support" icon={<LifeBuoy className="h-5 w-5" />} />
          <SidebarItem href="/dashboard/settings" label="Settings" icon={<Settings className="h-5 w-5" />} />
          
          <form action={logout} className="w-full mt-2">
            <button 
              type="submit" 
              onClick={() => playSound("liquid-glass")}
              className={cn(
              "w-full relative flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/30 text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent font-semibold text-xs uppercase shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col items-start truncate max-w-[100px]">
                  <span className="text-sm font-medium text-foreground leading-none mb-1 truncate w-full">{displayName}</span>
                  <span className="text-xs text-muted-foreground leading-none">Pro Plan</span>
                </div>
              </div>
              <LogOut className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          </form>

          <div className="mt-3 pt-2 text-[10px] text-center text-muted-foreground/40 tracking-widest uppercase font-medium flex items-center justify-center gap-1 select-none">
            Made with <span className="text-rose-500">❤️</span> by Andrew
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
