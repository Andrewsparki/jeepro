import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { PlannerWorkspace } from "@/features/planner/components/planner-workspace";

export const metadata: Metadata = constructMetadata({
  title: "Study Planner",
  noIndex: true,
});

export default function PlannerPage() {
  return (
    <div className="flex-1 h-full bg-background overflow-hidden">
      <PlannerWorkspace />
    </div>
  );
}
