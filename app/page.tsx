import type { Metadata } from "next";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { SubjectsSection } from "@/features/marketing/components/subjects-section";
import { DailyRitualSection } from "@/features/marketing/components/daily-ritual";
import { FocusSection } from "@/features/marketing/components/focus-section";
import { FeaturesSection } from "@/features/marketing/components/features-section";
import { CTASection } from "@/features/marketing/components/cta-section";

export const metadata: Metadata = {
  title: "JEE Pro — The Focused Study Operating System for JEE Main & Advanced",
  description:
    "Precision syllabus tracker, distraction-free focus chamber, and spaced-repetition engine across 90 Physics, Chemistry, and Mathematics chapters for serious JEE aspirants.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "JEE Pro — The Focused Study Operating System for JEE Main & Advanced",
    description:
      "Zero ads, zero social feeds. Master all 90 chapters of JEE Physics, Chemistry, and Mathematics with telemetry-driven precision.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JEE Pro — The Focused Study Operating System for JEE Main & Advanced",
    description:
      "Zero ads, zero social feeds. Master all 90 chapters of JEE Physics, Chemistry, and Mathematics with telemetry-driven precision.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "JEE Pro",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "Distraction-free preparation platform and syllabus operating system for JEE Main & Advanced aspirants covering 90 chapters.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  featureList: [
    "90 Chapter Taxonomy across Physics, Chemistry, and Mathematics",
    "Spaced Repetition Algorithm for Formula Retention",
    "Picture-in-Picture Floating Focus Chamber with Zero Notifications",
    "Universal Command Palette (Cmd + K) for Sub-50ms Navigation",
  ],
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full bg-transparent text-[#F4F4F6] flex flex-col justify-between overflow-x-hidden selection:bg-zinc-700 selection:text-white">
      {/* Search Engine Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 1. Global Atmospheric Backdrop */}
      <AmbientBackground variant="obsidian" />

      {/* 2. Floating Navbar */}
      <Navbar />

      {/* 3. Purposeful Narrative Flow */}
      <main className="flex-1 w-full flex flex-col">
        {/* Section 1: Hero with Live Interactive Workspace Preview */}
        <HeroSection />

        {/* Section 2: Interactive 90-Chapter Syllabus Explorer */}
        <SubjectsSection />

        {/* Section 3: Daily Study Protocol (The 4-Phase Stepper) */}
        <DailyRitualSection />

        {/* Section 4: Attention Architecture & Floating PiP Chamber */}
        <FocusSection />

        {/* Section 5: Platform Engine (Sub-50ms, Universal Cmd+K, AMOLED) */}
        <FeaturesSection />

        {/* Section 6: Resolute Closing CTA */}
        <CTASection />
      </main>

      {/* 4. Minimalist Technical Footer */}
      <Footer />
    </div>
  );
}
