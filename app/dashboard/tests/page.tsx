import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = constructMetadata({
  title: "Tests",
  noIndex: true,
});

export default function TestsPage() {
  return (
    <>
      <PageHeader
        title="Mock Tests"
        description="Full-length and topic-wise mock tests."
      />
      <EmptyState
        icon={FileText}
        title="Mock tests coming soon"
        description="JEE Main and Advanced pattern tests with detailed analytics will appear here."
      />
    </>
  );
}
