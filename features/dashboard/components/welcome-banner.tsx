"use client";

import { useUser } from "@/hooks/use-user";

export function WelcomeBanner() {
  const { user } = useUser();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Student";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="rounded-xl border border-border bg-card p-8 mb-8">
      <h2 className="text-2xl font-bold tracking-tight">
        {greeting}, {firstName}
      </h2>
      <p className="mt-2 text-sm text-muted">
        Continue where you left off, or explore something new.
      </p>
    </div>
  );
}
