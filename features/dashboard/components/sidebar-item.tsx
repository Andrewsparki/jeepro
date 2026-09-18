"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/settings-provider";
import { NavIconMotion, type NavIconVariant } from "./nav-icon-motion";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  layoutId?: string;
  iconVariant?: NavIconVariant;
}

export function SidebarItem({
  href,
  icon,
  label,
  badge,
  layoutId = "sidebar-active-indicator",
  iconVariant,
}: SidebarItemProps) {
  const pathname = usePathname();
  const { playSound } = useSettings();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const isRoot = href === "/dashboard";
  
  // Custom active logic: if it's the direct tab, require the tab=direct search param
  const isDirectMsg = href.includes("tab=direct");
  const isActive = isRoot 
    ? pathname === href 
    : (isDirectMsg 
        ? typeof window !== "undefined" && window.location.search.includes("tab=direct")
        : (pathname === href || pathname?.startsWith(`${href}/`)) && !(typeof window !== "undefined" && window.location.search.includes("tab=direct") && href === "/chat"));

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onClick={() => playSound("liquid-glass")}
      className={cn(
        "relative flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring w-full group select-none",
        isActive 
          ? "text-foreground font-semibold" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
      )}
    >
      {isActive && (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 rounded-lg bg-accent/15 border border-accent/20"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
            mass: 0.8
          }}
        />
      )}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <NavIconMotion
            href={href}
            variant={iconVariant}
            isHovered={isHovered}
            isPressed={isPressed}
            isActive={isActive}
            className={cn(
              "flex items-center justify-center transition-colors duration-200", 
              isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
            )}
          >
            {icon}
          </NavIconMotion>
          <span className="truncate">{label}</span>
        </div>
        {badge !== undefined && badge > 0 && (
          <div className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none flex items-center justify-center shrink-0">
            {badge > 99 ? '99+' : badge}
          </div>
        )}
      </div>
    </Link>
  );
}

