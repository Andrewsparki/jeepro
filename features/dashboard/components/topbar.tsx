"use client";

import { MobileNav } from "./mobile-nav";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useCommandPalette } from "@/features/search/context/command-palette-context";

interface TopbarProps {
  title?: string;
  greeting?: string;
}

export function Topbar({ title, greeting = "Good morning" }: TopbarProps) {
  const { profile, user } = useAuth();
  const { setIsOpen } = useCommandPalette();
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const initials = displayName.substring(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-background/40 px-6 backdrop-blur-2xl shadow-soft">
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
          className="text-muted-foreground hover:bg-white/5 hover:text-foreground hidden sm:flex items-center gap-2 rounded-full px-4"
          onClick={() => setIsOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
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
        <Button variant="ghost" size="icon" className="text-muted-foreground opacity-50 cursor-default hover:bg-transparent relative">
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
