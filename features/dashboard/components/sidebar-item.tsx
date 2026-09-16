"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HoverGlow } from "@/components/ui/hover-glow";
import { useSettings } from "@/providers/settings-provider";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

export function SidebarItem({ href, icon, label, badge }: SidebarItemProps) {
  const pathname = usePathname();
  const { playSound } = useSettings();
  const isRoot = href === "/dashboard";
  
  // Custom active logic: if it's the direct tab, require the tab=direct search param (rough check)
  // For standard routes, check exact match or startsWith
  const isDirectMsg = href.includes("tab=direct");
  const isActive = isRoot 
    ? pathname === href 
    : (isDirectMsg 
        ? typeof window !== "undefined" && window.location.search.includes("tab=direct")
        : (pathname === href || pathname?.startsWith(`${href}/`)) && !(typeof window !== "undefined" && window.location.search.includes("tab=direct") && href === "/chat"));

  return (
    <HoverGlow className="w-full block">
      <Link
        href={href}
        onClick={() => playSound("swish")}
        className={cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-out hover:shadow-[0_0_12px_rgba(37,99,235,0.3)] group outline-none focus-visible:ring-2 focus-visible:ring-ring w-full",
          isActive ? "text-white font-semibold shadow-glow" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute inset-0 rounded-lg bg-accent/20"
            initial={false}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div 
              className={cn("flex items-center justify-center transition-colors duration-200", isActive && "text-white")}
            >
              {icon}
            </div>
            <span className="truncate">{label}</span>
          </div>
          {badge !== undefined && badge > 0 && (
            <div className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-none flex items-center justify-center">
              {badge > 99 ? '99+' : badge}
            </div>
          )}
        </div>
      </Link>
    </HoverGlow>
  );
}
