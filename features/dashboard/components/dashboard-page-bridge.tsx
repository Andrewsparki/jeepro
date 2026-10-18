"use client";

import React, { useEffect, useRef } from "react";
import { CompleteDashboardMetrics } from "@/features/study/services/progress";
import { useOptionalDashboardData, DashboardDataProvider } from "@/features/dashboard/context/dashboard-data-context";
import { DashboardContent } from "./dashboard-content";

interface DashboardPageBridgeProps {
  initialMetrics: CompleteDashboardMetrics | null;
}

export function DashboardPageBridge({ initialMetrics }: DashboardPageBridgeProps) {
  const context = useOptionalDashboardData();

  // If already mounted inside the persistent layout provider, use it and sync initial metrics seamlessly
  if (context) {
    return <DashboardPageSync initialMetrics={initialMetrics} />;
  }

  // Fallback for standalone/isolated renders
  return (
    <DashboardDataProvider initialMetrics={initialMetrics}>
      <DashboardContent initialMetrics={initialMetrics} />
    </DashboardDataProvider>
  );
}

function DashboardPageSync({ initialMetrics }: { initialMetrics: CompleteDashboardMetrics | null }) {
  const { criticalMetrics, seedMetrics } = useOptionalDashboardData()!;
  const hasSeededRef = useRef(false);

  // Seed metrics immediately when received from server without causing duplicate fetches or skeletons
  useEffect(() => {
    if (initialMetrics && (!criticalMetrics || !hasSeededRef.current)) {
      hasSeededRef.current = true;
      seedMetrics(initialMetrics);
    }
  }, [initialMetrics, criticalMetrics, seedMetrics]);

  return <DashboardContent initialMetrics={initialMetrics} />;
}
