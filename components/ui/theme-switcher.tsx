"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Contrast, Layers, SunMedium } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/settings-provider";

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { updateSetting } = useSettings();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("w-7 h-7 rounded-md bg-muted/30 animate-pulse", className)} />;
  }

  const cycleTheme = () => {
    let nextTheme = "midnight";
    if (theme === "midnight") nextTheme = "amoled";
    else if (theme === "amoled") nextTheme = "titanium";
    else if (theme === "titanium") nextTheme = "light";
    else nextTheme = "midnight";

    setTheme(nextTheme);
    updateSetting("activeTheme", nextTheme as "midnight" | "amoled" | "titanium" | "light");
  };

  const themeLabel = 
    theme === "light" 
      ? "Daylight" 
      : theme === "titanium" 
      ? "Titanium" 
      : theme === "amoled" 
      ? "AMOLED" 
      : "Midnight";

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150",
        "bg-transparent hover:bg-muted/40 text-muted-foreground/80 hover:text-foreground border border-border/30 hover:border-border/60",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring select-none",
        className
      )}
      aria-label="Toggle Theme"
      title={`Theme: ${themeLabel}`}
    >
      {theme === "midnight" && <Moon size={13} className="stroke-[1.75]" />}
      {theme === "amoled" && <Contrast size={13} className="stroke-[1.75]" />}
      {theme === "titanium" && <Layers size={13} className="stroke-[1.75]" />}
      {theme === "light" && <SunMedium size={13} className="stroke-[1.75]" />}
    </button>
  );
}

