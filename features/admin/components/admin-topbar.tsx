"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Bell,
  Settings,
  ScrollText,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Users",
  "/admin/notifications": "Notifications",
  "/admin/system": "System Controls",
  "/admin/audit-log": "Audit Log",
};

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/system", label: "System Controls", icon: Settings },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
];

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
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 lg:px-6 border-b border-white/[0.06] bg-[#0c0c0c]/95 backdrop-blur-md">
        {/* Mobile menu */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-zinc-600">/</span>}
              {i === breadcrumbs.length - 1 ? (
                <span className="text-zinc-300 font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Mobile brand */}
        <div className="flex lg:hidden items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-white">Admin</span>
        </div>

        {/* Admin info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-zinc-400">{adminName || adminEmail}</p>
            <p className="text-[10px] text-amber-500/70 uppercase tracking-wider font-medium">Administrator</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="w-[280px] min-h-screen bg-[#0c0c0c] border-r border-white/[0.06] p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-3 py-3 mb-4 border-b border-white/[0.06]">
              <Shield className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-semibold text-white">JEE Pro Admin</span>
            </div>

            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-white/[0.06]">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
