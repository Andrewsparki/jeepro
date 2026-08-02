import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = constructMetadata({
  title: "About",
  description: "Learn about JEE Pro and our mission.",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      <PageHeader
        title="About JEE Pro"
        description="Our mission is to make JEE preparation accessible, effective, and enjoyable."
      />
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted">About page content coming soon.</p>
      </div>
    </div>
  );
}
