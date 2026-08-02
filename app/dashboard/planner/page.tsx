import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = constructMetadata({
  title: "Planner",
  noIndex: true,
});

export default function PlannerPage() {
  return (
    <>
      <PageHeader
        title="Planner"
        description="Schedule your study sessions and manage your time."
      />
      <EmptyState
        icon={Calendar}
        title="Planner coming soon"
        description="A powerful study calendar and task manager will appear here."
      />
    </>
  );
}
