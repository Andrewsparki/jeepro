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
    <div className="pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Settings Layout with Horizontal Sub-Nav */}
      <SettingsLayout>
        <ProfileSection />
        <AppearanceSection />
        <StudyExperienceSection />
        <PrivacySection />
        <AboutSection />
        <TypographyArt />
        <CreatorSupport />
      </SettingsLayout>
    </div>
  );
}
