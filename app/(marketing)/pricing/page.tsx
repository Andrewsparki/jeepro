import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { LandingBackground } from "@/components/layout/landing-background";
import { PricingPlans } from "@/features/marketing/components/pricing-plans";
import { PricingComparison } from "@/features/marketing/components/pricing-comparison";
import { PricingWhy } from "@/features/marketing/components/pricing-why";
import { PricingFAQ } from "@/features/marketing/components/pricing-faq";
import { PricingCTA } from "@/features/marketing/components/pricing-cta";

export const metadata: Metadata = constructMetadata({
  title: "Pricing • Simple, Transparent Preparation Plans",
  description: "Start free with full syllabus access and upgrade to Pro tools for adaptive practice, mock tests, and deep analytics.",
});

export default function PricingPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#03060E] text-[#F5F7FF] flex flex-col justify-between overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Continuous Atmospheric Canvas (Runs smoothly through all sections) */}
      <LandingBackground />

      {/* Main Content Flow */}
      <div className="flex-1 w-full flex flex-col">
        {/* 1. Pricing Hero & 3-Tier Glass Cards */}
        <PricingPlans />

        {/* 2. Full Feature Comparison Matrix */}
        <PricingComparison />

        {/* 3. Why JEE Pro Value Pillars */}
        <PricingWhy />

        {/* 4. Interactive Accordion FAQ */}
        <PricingFAQ />

        {/* 5. Atmospheric Final CTA */}
        <PricingCTA />
      </div>
    </div>
  );
}
