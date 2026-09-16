"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/constants/site";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  LineChart, 
  Calendar, 
  Settings,
  MessageSquare,
  Users,
  Trophy,
  Award,
  ChevronDown,
  ChevronRight,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useDirectConversations } from "@/features/chat/hooks/use-direct-conversations";
import { useFriends } from "@/features/friends/hooks/use-friends";
import { motion, AnimatePresence } from "framer-motion";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/dashboard/study", label: "Study", icon: <BookOpen className="h-5 w-5" /> },
  { href: "/dashboard/syllabus", label: "Syllabus", icon: <Target className="h-5 w-5" /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <LineChart className="h-5 w-5" /> },
  { href: "/dashboard/planner", label: "Planner", icon: <Calendar className="h-5 w-5" /> },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(true);
  
  const { totalUnreadCount } = useDirectConversations();
  const { pendingReceived } = useFriends();

  const socialNav = [
    { href: "/chat", label: "Global Chat", icon: <MessageSquare className="h-5 w-5" />, badge: totalUnreadCount },
    { href: "/friends", label: "Friends", icon: <Users className="h-5 w-5" />, badge: pendingReceived?.length || 0 },
    { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="h-5 w-5" /> },
    { href: "/achievements", label: "Achievements", icon: <Award className="h-5 w-5" /> },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r border-border/40 bg-background/95 backdrop-blur-xl flex flex-col">
        <div className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Main navigation for the application</SheetDescription>
        </div>
        
        <div className="flex h-14 items-center px-6 border-b border-border/40">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 font-bold tracking-tight text-lg">
            <div className="h-6 w-6 rounded-md bg-foreground flex items-center justify-center">
              <span className="text-background text-xs font-black">J</span>
            </div>
            {siteConfig.name}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="flex flex-col gap-1">
            {mainNav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors hover:text-foreground",
                    isActive ? "bg-muted/50 text-foreground border border-border/50" : "text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
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
                      : (pathname === item.href || pathname?.startsWith(`${item.href}/`)) && !(typeof window !== "undefined" && window.location.search.includes("tab=direct") && item.href === "/chat");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium transition-colors hover:text-foreground",
                          isActive ? "bg-muted/50 text-foreground border border-border/50" : "text-muted-foreground hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <div className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none flex items-center justify-center">
                            {item.badge > 99 ? '99+' : item.badge}
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="p-4 border-t border-border/40">
           <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors hover:text-foreground",
                  pathname === "/dashboard/settings" ? "bg-muted/50 text-foreground border border-border/50" : "text-muted-foreground hover:bg-muted/30"
                )}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
            </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
