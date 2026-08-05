"use client";

import { SettingsLayout } from "@/features/settings/components/settings-layout";
import { ProfileSection } from "@/features/settings/components/sections/profile-section";
import { AppearanceSection } from "@/features/settings/components/sections/appearance-section";
import { StudyExperienceSection } from "@/features/settings/components/sections/study-experience-section";
import { PrivacySection } from "@/features/settings/components/sections/privacy-section";
import { AboutSection } from "@/features/settings/components/sections/about-section";
import { TypographyArt } from "@/features/settings/components/sections/typography-art";
import { CreatorSupport } from "@/features/settings/components/sections/creator-support";

export default function SettingsPage() {
  return (
    <div className="pt-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto animate-stagger-container">
      
      {/* Premium Header */}
      <div className="mb-16 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground/90 mb-4">
          Settings
        </h1>
        <p className="text-base text-muted-foreground/80 leading-relaxed">
          Manage your account preferences, tailor your study environment, and customize the visual experience.
        </p>
      </div>

      <SettingsLayout>
        <ProfileSection />
        <AppearanceSection />
        
        {/* Artistic Typography Break */}
        <TypographyArt />
        
        <StudyExperienceSection />
        <PrivacySection />
        <AboutSection />
        
        <CreatorSupport />
      </SettingsLayout>
      
    </div>
  );
}
