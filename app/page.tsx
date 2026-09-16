import { AmbientBackground } from "@/components/layout/ambient-background";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { SubjectsSection } from "@/features/marketing/components/subjects-section";
import { ProgressShowcase } from "@/features/marketing/components/progress-showcase";
import { FeaturesSection } from "@/features/marketing/components/features-section";
import { FocusSection } from "@/features/marketing/components/focus-section";
import { CTASection } from "@/features/marketing/components/cta-section";

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full bg-transparent text-[#F5F7FF] flex flex-col justify-between overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* 1. Continuous Global Atmospheric Canvas */}
      <AmbientBackground />

      {/* 2. Floating Translucent Glass Pill Navbar */}
      <Navbar />

      {/* 3. Main Content Flow */}
      <main className="flex-1 w-full flex flex-col">
        {/* Section 1: Cinematic Hero */}
        <HeroSection />

        {/* Section 2: Subject Architecture (Physics, Chemistry, Mathematics) */}
        <SubjectsSection />

        {/* Section 3: Live Progress & Telemetry Showcase */}
        <ProgressShowcase />

        {/* Section 4: Intelligent Bento Features Ecosystem */}
        <FeaturesSection />

        {/* Section 5: Distraction-Free Study Philosophy */}
        <FocusSection />

        {/* Section 6: Final Atmospheric CTA */}
        <CTASection />
      </main>

      {/* 4. Minimalist Premium Footer */}
      <Footer />
    </div>
  );
}
