"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HoverGlow } from "@/components/ui/hover-glow";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function SidebarItem({ href, icon, label }: SidebarItemProps) {
  const pathname = usePathname();
  const isRoot = href === "/dashboard";
  const isActive = isRoot 
    ? pathname === href 
    : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <HoverGlow className="w-full block">
      <Link
        href={href}
        className={cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-ring w-full",
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
        <div className="relative z-10 flex items-center gap-3 w-full">
          <div 
            className={cn("flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:rotate-[5deg] active:scale-90", isActive && "text-white")}
          >
            {icon}
          </div>
          <span className="truncate">{label}</span>
        </div>
      </Link>
    </HoverGlow>
  );
}
