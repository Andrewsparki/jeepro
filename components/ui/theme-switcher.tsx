"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { 
  Sparkles, 
  Zap, 
  Moon, 
  Activity, 
  Layers, 
  Check,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/settings-provider";
import { VisualThemeId, VISUAL_THEMES } from "@/types/theme";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ThemeOption {
  id: VisualThemeId;
  name: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
  primaryColor: string;
  secondaryColor: string;
  swatches: [string, string];
}

const THEMES_CONFIG: readonly ThemeOption[] = [
  {
    id: "obsidian",
    name: "Obsidian Blue",
    icon: Sparkles,
    primaryColor: VISUAL_THEMES.obsidian.primaryAccent,
    secondaryColor: VISUAL_THEMES.obsidian.secondaryAccent,
    swatches: [VISUAL_THEMES.obsidian.primaryAccent, VISUAL_THEMES.obsidian.secondaryAccent],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    icon: Zap,
    primaryColor: VISUAL_THEMES.cyberpunk.primaryAccent,
    secondaryColor: VISUAL_THEMES.cyberpunk.secondaryAccent,
    swatches: [VISUAL_THEMES.cyberpunk.primaryAccent, VISUAL_THEMES.cyberpunk.secondaryAccent],
  },
  {
    id: "midnight",
    name: "Midnight",
    icon: Moon,
    primaryColor: VISUAL_THEMES.midnight.primaryAccent,
    secondaryColor: VISUAL_THEMES.midnight.secondaryAccent,
    swatches: [VISUAL_THEMES.midnight.primaryAccent, VISUAL_THEMES.midnight.secondaryAccent],
  },
  {
    id: "neon-arena",
    name: "Neon Arena",
    icon: Activity,
    primaryColor: VISUAL_THEMES["neon-arena"].primaryAccent,
    secondaryColor: VISUAL_THEMES["neon-arena"].secondaryAccent,
    swatches: [VISUAL_THEMES["neon-arena"].primaryAccent, VISUAL_THEMES["neon-arena"].secondaryAccent],
  },
  {
    id: "minimal-wave",
    name: "Minimal Wave",
    icon: Layers,
    primaryColor: VISUAL_THEMES["minimal-wave"].primaryAccent,
    secondaryColor: VISUAL_THEMES["minimal-wave"].secondaryAccent,
    swatches: [VISUAL_THEMES["minimal-wave"].primaryAccent, VISUAL_THEMES["minimal-wave"].secondaryAccent],
  },
] as const;

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting, playSound } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("w-7 h-7 rounded-md bg-muted/30 animate-pulse", className)} />;
  }

  const currentThemeId = (theme as VisualThemeId) || settings.activeTheme || "obsidian";
  const currentConfig = THEMES_CONFIG.find((t) => t.id === currentThemeId) || THEMES_CONFIG[0];
  const ActiveIcon = currentConfig.icon;

  const handleSelectTheme = (nextTheme: VisualThemeId) => {
    if (nextTheme === currentThemeId) return;
    setTheme(nextTheme);
    updateSetting("activeTheme", nextTheme);
    playSound?.("click");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 relative",
            "bg-transparent hover:bg-muted/40 text-muted-foreground/80 hover:text-foreground border border-border/30 hover:border-border/60",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring select-none cursor-pointer",
            isOpen && "bg-accent/15 border-accent/40 text-accent shadow-[0_0_12px_var(--accent-glow)]",
            className
          )}
          aria-label="Select Appearance Theme"
          title={`Appearance Theme: ${currentConfig.name} (Click to open menu)`}
        >
          <ActiveIcon size={13} className="stroke-[1.75]" style={{ color: currentConfig.primaryColor }} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-56 p-1.5 rounded-xl border border-border bg-card/95 text-foreground shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_24px_var(--accent-glow)] backdrop-blur-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-150"
      >
        <div className="px-2.5 py-1.5 flex items-center justify-between">
          <DropdownMenuLabel className="p-0 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Stage Atmosphere
          </DropdownMenuLabel>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border/80 text-muted-foreground">
            5 Themes
          </span>
        </div>

        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-border/60" />

        <div className="space-y-0.5">
          {THEMES_CONFIG.map((item) => {
            const isSelected = currentThemeId === item.id;
            const ItemIcon = item.icon;

            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleSelectTheme(item.id)}
                className={cn(
                  "group relative flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium outline-none transition-all duration-150 cursor-pointer select-none",
                  isSelected
                    ? "bg-accent/15 text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10 focus:bg-accent/12 focus:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-transform duration-150 group-hover:scale-105",
                      isSelected ? "shadow-xs" : ""
                    )}
                    style={{
                      backgroundColor: `${item.primaryColor}18`,
                      borderColor: `${item.primaryColor}38`,
                      color: item.primaryColor,
                    }}
                  >
                    <ItemIcon size={12} className="stroke-[2]" />
                  </div>
                  <span className="truncate">{item.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Small dual-color preview swatches */}
                  <div className="flex items-center -space-x-1" title={`${item.name} color preview`}>
                    {item.swatches.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-2.5 h-2.5 rounded-full border border-background shadow-xs ring-1 ring-white/10 shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Active Checkmark indicator */}
                  <div className="w-4 flex items-center justify-center shrink-0">
                    {isSelected && (
                      <Check size={13} className="stroke-[2.5] text-accent animate-in fade-in-0 zoom-in-75 duration-150" />
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
