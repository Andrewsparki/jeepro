import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { LandingBackground } from "@/components/layout/landing-background";
import { AboutHero } from "@/features/marketing/components/about-hero";
import { AboutProblemSolution } from "@/features/marketing/components/about-problem-solution";
import { AboutPrinciplesLoop } from "@/features/marketing/components/about-principles-loop";
import { AboutDifference } from "@/features/marketing/components/about-difference";
import { AboutMissionCTA } from "@/features/marketing/components/about-mission-cta";

export const metadata: Metadata = constructMetadata({
  title: "About • Built for Purposeful JEE Preparation",
  description: "Learn why JEE PRO was created: a focused study operating system bringing syllabus tracking, adaptive practice, revision, and analytics into one distraction-free platform.",
});

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#03060E] text-[#F5F7FF] flex flex-col justify-between overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Continuous Atmospheric Canvas */}
      <LandingBackground />

      {/* Main Content Flow */}
      <div className="flex-1 w-full flex flex-col space-y-28 sm:space-y-36">
        {/* Section 1: Hero */}
        <AboutHero />

        {/* Sections 2 & 3: The Problem & The Solution */}
        <AboutProblemSolution />

        {/* Sections 4 & 5: Core Principles & Preparation Loop */}
        <AboutPrinciplesLoop />

        {/* Sections 6 & 7: The JEE PRO Difference & Subject Workflows */}
        <AboutDifference />

        {/* Sections 8, 9, 10: Mission, Future Vision & Final CTA */}
        <AboutMissionCTA />
      </div>
    </div>
  );
}
