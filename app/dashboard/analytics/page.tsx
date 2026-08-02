import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = constructMetadata({
  title: "Analytics",
  noIndex: true,
});

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Track your progress and performance trends."
      />
      <EmptyState
        icon={BarChart3}
        title="Analytics coming soon"
        description="Detailed performance charts and insights will appear here."
      />
    </>
  );
}
