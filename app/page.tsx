import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { FeaturesSection } from "@/features/marketing/components/features-section";
import { WhySection } from "@/features/marketing/components/why-section";
import { DashboardPreview } from "@/features/marketing/components/dashboard-preview";
import { TestimonialsSection } from "@/features/marketing/components/testimonials-section";
import { FaqSection } from "@/features/marketing/components/faq-section";
import { CTASection } from "@/features/marketing/components/cta-section";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <WhySection />
        <DashboardPreview />
        <TestimonialsSection />
        <FaqSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
