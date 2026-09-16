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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/system", label: "System Controls", icon: Settings },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] min-h-screen border-r border-white/[0.06] bg-[#0c0c0c]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Shield className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white tracking-tight">JEE Pro</h1>
          <p className="text-[11px] text-amber-500/80 font-medium tracking-wide uppercase">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-amber-400" : "text-zinc-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}
