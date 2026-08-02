import type { ReactNode } from "react";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <main className="lg:pl-64 min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </div>
    </main>
  );
}
