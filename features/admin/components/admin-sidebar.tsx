"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bell,
  Settings,
  ScrollText,
  Shield,
  ArrowLeft,
  Flag,
  LifeBuoy,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, LayoutGroup } from "framer-motion";
import { ADMIN_SPRING_SNAPPY } from "./motion";
import { playHapticSound } from "@/lib/sound-effects";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/whats-new", label: "What's New", icon: Sparkles },
  { href: "/admin/reports", label: "Chat Moderation", icon: Flag },
  { href: "/admin/support", label: "Support Desk", icon: LifeBuoy },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/system", label: "System Controls", icon: Settings },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] min-h-screen border-r border-white/[0.06] bg-[#0c0c0c] select-none">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 shadow-[0_0_16px_rgba(245,158,11,0.12)]"
        >
          <Shield className="w-5 h-5 text-amber-500" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-75 pointer-events-none" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 pointer-events-none" />
        </motion.div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-semibold text-white tracking-tight">JEE Pro</h1>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider uppercase">
              Ops
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium tracking-wide">Command Center</p>
        </div>
      </div>

      {/* Navigation */}
      <LayoutGroup id="admin-sidebar-nav">
        <nav className="flex-1 px-3 py-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <motion.div
                key={item.href}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <Link
                  href={item.href}
                  onClick={() => playHapticSound("click")}
                  className={cn(
                    "relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 outline-none",
                    isActive
                      ? "text-amber-400 font-semibold"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-200",
                      isActive ? "text-amber-400 scale-105" : "text-zinc-500"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>

                {isActive && (
                  <motion.div
                    layoutId="admin-sidebar-active"
                    className="absolute inset-0 rounded-lg bg-amber-500/10 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.08)] pointer-events-none"
                    transition={ADMIN_SPRING_SNAPPY}
                  />
                )}
              </motion.div>
            );
          })}
        </nav>
      </LayoutGroup>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <motion.div whileTap={{ scale: 0.98 }}>
          <Link
            href="/dashboard"
            onClick={() => playHapticSound("click")}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-all duration-200 outline-none"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Return to App</span>
          </Link>
        </motion.div>
      </div>
    </aside>
  );
}
