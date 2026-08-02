"use client";

import { MobileNav } from "./mobile-nav";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";

interface TopbarProps {
  title?: string;
  greeting?: string;
}

export function Topbar({ title, greeting = "Good morning" }: TopbarProps) {
  const { profile, user } = useAuth();
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const initials = displayName.substring(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/40 bg-background/80 px-6 backdrop-blur-md">
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
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="md:hidden ml-2 h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent font-semibold text-xs uppercase">
          {initials}
        </div>
      </div>
    </header>
  );
}
