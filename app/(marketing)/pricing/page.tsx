import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = constructMetadata({
  title: "Pricing",
  description: "Simple, transparent pricing for JEE preparation.",
});

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24">
      <PageHeader
        title="Pricing"
        description="Simple, transparent pricing. No hidden fees."
      />
      {/* Pricing tiers will be implemented here */}
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted">Pricing plans coming soon.</p>
      </div>
    </div>
  );
}
