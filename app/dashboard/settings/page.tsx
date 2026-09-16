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
    <div className="relative min-h-screen pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Apple VisionOS Spatial Ambient Background Lights */}
      <div className="fixed top-24 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[30rem] h-[30rem] bg-purple-600/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-10 w-80 h-80 bg-blue-600/8 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Settings Layout with Floating Apple Glass Capsule Sub-Nav */}
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
