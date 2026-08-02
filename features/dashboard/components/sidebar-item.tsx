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
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <HoverGlow className="w-full block">
      <Link
        href={href}
        className={cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-ring w-full",
          isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute inset-0 rounded-lg bg-white/10 border border-white/20"
            initial={false}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <div className="relative z-10 flex items-center gap-3 w-full">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }} 
            whileTap={{ scale: 0.9 }}
            className={cn("flex items-center justify-center", isActive && "text-white")}
          >
            {icon}
          </motion.div>
          <span className="truncate">{label}</span>
        </div>
      </Link>
    </HoverGlow>
  );
}
