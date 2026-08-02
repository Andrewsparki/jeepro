"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex rounded-xl bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted">An unexpected error occurred.</p>
        <button
          onClick={reset}
          className="mt-8 inline-flex items-center rounded-lg bg-card border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
