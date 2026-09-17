"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  LineChart, 
  Calendar, 
  Settings, 
  Menu,
  History,
  Crosshair,
  MessageSquare,
  Users,
  Trophy,
  Award,
  ChevronDown,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useDirectConversations } from "@/features/chat/hooks/use-direct-conversations";
import { useFriends } from "@/features/friends/hooks/use-friends";
import { motion, AnimatePresence } from "framer-motion";
import { NavIconMotion } from "./nav-icon-motion";
import { BrandLogo } from "./brand-logo";

function MobileNavItem({
  href,
  label,
  icon,
  badge,
  isActive,
  onSelect,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Link
      href={href}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onSelect}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium transition-colors select-none",
        isActive 
          ? "bg-accent/15 text-foreground border border-accent/20 font-semibold" 
          : "text-muted-foreground hover:bg-muted/30 hover:text-foreground active:bg-muted/40"
      )}
    >
      <div className="flex items-center gap-3">
        <NavIconMotion
          href={href}
          isHovered={false}
          isPressed={isPressed}
          isActive={isActive}
          className={cn(
            "flex items-center justify-center transition-colors duration-200",
            isActive ? "text-accent" : "text-muted-foreground"
          )}
        >
          {icon}
        </NavIconMotion>
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <div className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </div>
      )}
    </Link>
  );
}

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/dashboard/focus", label: "Focus", icon: <Crosshair className="h-5 w-5" /> },
  { href: "/dashboard/study", label: "Study", icon: <BookOpen className="h-5 w-5" /> },
  { href: "/dashboard/syllabus", label: "Syllabus", icon: <Target className="h-5 w-5" /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <LineChart className="h-5 w-5" /> },
  { href: "/dashboard/planner", label: "Planner", icon: <Calendar className="h-5 w-5" /> },
  { href: "/dashboard/history", label: "History", icon: <History className="h-5 w-5" /> },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(true);
  
  const { totalUnreadCount } = useDirectConversations();
  const { pendingReceived } = useFriends();

  const socialNav = [
    { href: "/dashboard/chat", label: "Global Chat", icon: <MessageSquare className="h-5 w-5" />, badge: totalUnreadCount },
    { href: "/dashboard/friends", label: "Friends", icon: <Users className="h-5 w-5" />, badge: pendingReceived?.length || 0 },
    { href: "/dashboard/groups", label: "Study Groups", icon: <GraduationCap className="h-5 w-5" /> },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: <Trophy className="h-5 w-5" /> },
    { href: "/dashboard/achievements", label: "Achievements", icon: <Award className="h-5 w-5" /> },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r border-border/40 bg-background/95 backdrop-blur-xl flex flex-col justify-between">
        <div className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Main navigation for the application</SheetDescription>
        </div>
        
        <div className="flex h-14 items-center px-4 border-b border-border/25 shrink-0">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="outline-none">
            <BrandLogo size="sm" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="flex flex-col gap-1">
            {mainNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}/`));
              return (
                <MobileNavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive}
                  onSelect={() => setOpen(false)}
                />
              )
            })}
          </nav>
          
          <div className="mt-6 mb-2">
            <button 
              onClick={() => setIsSocialOpen(!isSocialOpen)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              SOCIAL
              {isSocialOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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
                  {socialNav.map((item) => {
                    const isDirectMsg = item.href.includes("tab=direct");
                    const isActive = isDirectMsg 
                      ? typeof window !== "undefined" && window.location.search.includes("tab=direct")
                      : (pathname === item.href || pathname?.startsWith(`${item.href}/`)) && !(typeof window !== "undefined" && window.location.search.includes("tab=direct") && item.href === "/dashboard/chat");
                    return (
                      <MobileNavItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        badge={item.badge}
                        isActive={isActive}
                        onSelect={() => setOpen(false)}
                      />
                    )
                  })}
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="p-4 border-t border-border/40">
           <MobileNavItem
             href="/dashboard/settings"
             label="Settings"
             icon={<Settings className="h-5 w-5" />}
             isActive={pathname === "/dashboard/settings"}
             onSelect={() => setOpen(false)}
           />
        </div>
      </SheetContent>
    </Sheet>
  );
}
