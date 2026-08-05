"use client";

import Link from "next/link";
import { siteConfig } from "@/constants/site";
import { SidebarItem } from "./sidebar-item";
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  LineChart, 
  Calendar, 
  Settings,
  LogOut,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/components/auth-provider";
import { logout } from "@/features/auth/actions/auth";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/dashboard/study", label: "Study", icon: <BookOpen className="h-5 w-5" /> },
  { href: "/dashboard/syllabus", label: "Syllabus", icon: <Target className="h-5 w-5" /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <LineChart className="h-5 w-5" /> },
  { href: "/dashboard/planner", label: "Planner", icon: <Calendar className="h-5 w-5" /> },
  { href: "/dashboard/history", label: "History", icon: <History className="h-5 w-5" /> },
];

export function Sidebar() {
  const { profile, user } = useAuth();
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const initials = displayName.substring(0, 1).toUpperCase();

  return (
    <aside className="hidden w-64 flex-col border-r border-border/40 bg-background/95 md:flex h-screen sticky top-0">
      <div className="flex h-14 items-center px-6 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight text-lg">
          <div className="h-6 w-6 rounded-md bg-foreground flex items-center justify-center">
            <span className="text-background text-xs font-black">J</span>
          </div>
          {siteConfig.name}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="flex flex-col gap-1">
          {mainNav.map((item) => (
            <SidebarItem key={item.href} {...item} />
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border/40 flex flex-col gap-1">
        <SidebarItem href="/dashboard/settings" label="Settings" icon={<Settings className="h-5 w-5" />} />
        
        <form action={logout} className="w-full mt-2">
          <button type="submit" className={cn(
            "w-full relative flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/30 text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent font-semibold text-xs uppercase">
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
      </div>
    </aside>
  );
}
