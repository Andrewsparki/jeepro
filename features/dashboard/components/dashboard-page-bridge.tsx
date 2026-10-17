"use client";

import React, { useEffect } from "react";
import { CompleteDashboardMetrics } from "@/features/study/services/progress";
import { useOptionalDashboardData, DashboardDataProvider } from "@/features/dashboard/context/dashboard-data-context";
import { DashboardContent } from "./dashboard-content";

interface DashboardPageBridgeProps {
  initialMetrics: CompleteDashboardMetrics | null;
}

export function DashboardPageBridge({ initialMetrics }: DashboardPageBridgeProps) {
  const context = useOptionalDashboardData();

  // If already mounted inside the persistent layout provider, use it and sync initial metrics if needed
  if (context) {
    return <DashboardPageSync initialMetrics={initialMetrics} />;
  }

  // Fallback for standalone/isolated renders
  return (
    <DashboardDataProvider initialMetrics={initialMetrics}>
      <DashboardContent />
    </DashboardDataProvider>
  );
}

function DashboardPageSync({ initialMetrics }: { initialMetrics: CompleteDashboardMetrics | null }) {
  const { criticalMetrics, refreshMetrics } = useOptionalDashboardData()!;

  // If the layout context is completely empty and SSR provided metrics, refresh seamlessly
  useEffect(() => {
    if (!criticalMetrics && initialMetrics) {
      void refreshMetrics();
    }
  }, [criticalMetrics, initialMetrics, refreshMetrics]);

  return <DashboardContent />;
}
