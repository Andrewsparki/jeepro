"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ADMIN_NAV_ITEMS } from "./admin-sidebar";
import { ADMIN_SPRING_SNAPPY, ADMIN_EASE_FLUID } from "./motion";
import { playHapticSound } from "@/lib/sound-effects";

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/reports": "Chat Moderation",
  "/admin/support": "Support Desk",
  "/admin/users": "Users",
  "/admin/notifications": "Notifications",
  "/admin/system": "System Controls",
  "/admin/audit-log": "Audit Log",
};

interface AdminTopbarProps {
  adminName?: string | null;
  adminEmail?: string;
}

export function AdminTopbar({ adminName, adminEmail }: AdminTopbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Build breadcrumbs
  const breadcrumbs: { label: string; href: string }[] = [{ label: "Admin", href: "/admin" }];

  // Check for user detail pages
  if (pathname.startsWith("/admin/users/") && pathname !== "/admin/users") {
    breadcrumbs.push({ label: "Users", href: "/admin/users" });
    breadcrumbs.push({ label: "User Detail", href: pathname });
  } else {
    const match = Object.entries(BREADCRUMB_MAP).find(([path]) =>
      path === "/admin" ? pathname === path : pathname.startsWith(path)
    );
    if (match && match[0] !== "/admin") {
      breadcrumbs.push({ label: match[1], href: match[0] });
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 lg:px-6 border-b border-white/[0.06] bg-[#0c0c0c]/90 backdrop-blur-xl">
        {/* Mobile menu toggle */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            playHapticSound("click");
            setMobileOpen(!mobileOpen);
          }}
          className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>

        {/* Breadcrumbs with subtle slide-in */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm select-none">
          {breadcrumbs.map((crumb, i) => (
            <motion.span
              key={crumb.href}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04, ease: ADMIN_EASE_FLUID }}
              className="flex items-center gap-1.5"
            >
              {i > 0 && <span className="text-zinc-600">/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span className="text-amber-300 font-medium">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  onClick={() => playHapticSound("click")}
                  className="text-zinc-500 hover:text-zinc-200 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </motion.span>
          ))}
        </nav>

        {/* Mobile brand */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20">
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-sm font-semibold text-white">Admin Control</span>
        </div>

        {/* Admin profile pill */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 py-1 px-2 rounded-lg transition-colors hover:bg-white/[0.02]"
        >
          <div className="hidden sm:block text-right">
            <p className="text-xs text-zinc-300 font-medium leading-tight">{adminName || adminEmail}</p>
            <p className="text-[10px] text-amber-500/80 uppercase tracking-wider font-semibold">Security Root</p>
          </div>
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-[#0c0c0c]" />
          </div>
        </motion.div>
      </header>

      {/* Mobile Animated Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={ADMIN_SPRING_SNAPPY}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#0c0c0c] border-r border-white/[0.08] p-4 flex flex-col justify-between shadow-2xl z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white block">JEE Pro Admin</span>
                      <span className="text-[10px] text-amber-400/80 font-mono">SECURE ACCESS</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 rounded text-zinc-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {ADMIN_NAV_ITEMS.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                    return (
                      <motion.div key={item.href} whileTap={{ scale: 0.97 }}>
                        <Link
                          href={item.href}
                          onClick={() => {
                            playHapticSound("click");
                            setMobileOpen(false);
                          }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                          )}
                        >
                          <item.icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-zinc-500")} />
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <Link
                  href="/dashboard"
                  onClick={() => {
                    playHapticSound("click");
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to App
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
