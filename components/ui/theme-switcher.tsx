"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Contrast } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("w-9 h-9 rounded-full bg-surface animate-pulse", className)} />;
  }

  const cycleTheme = () => {
    if (theme === "midnight") setTheme("amoled");
    else if (theme === "amoled") setTheme("light");
    else setTheme("midnight");
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-full transition-all duration-normal ease-fluid",
        "bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground border border-transparent hover:border-glass-border",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className
      )}
      aria-label="Toggle Theme"
      title={`Current Theme: ${theme?.charAt(0).toUpperCase()}${theme?.slice(1)}`}
    >
      {theme === "midnight" && <Moon size={18} />}
      {theme === "amoled" && <Contrast size={18} />}
      {theme === "light" && <Sun size={18} />}
    </button>
  );
}
