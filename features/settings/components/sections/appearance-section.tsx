"use client";

import { useState } from "react";
import { Palette, ChevronDown } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { PremiumSwitch } from "../ui/premium-switch";
import { cn } from "@/lib/utils";

export function AppearanceSection() {
  const [viewStyle, setViewStyle] = useState<"carousel" | "grid">("carousel");
  const [detailType, setDetailType] = useState<"page" | "modal">("page");
  const [useFormulas, setUseFormulas] = useState(true);
  const [autoAudio, setAutoAudio] = useState(true);
  const [theme, setTheme] = useState("Default");

  return (
    <GlassSection 
      id="appearance" 
      title="Appearance" 
      icon={Palette} 
      description="Change the look of the site to suit your needs."
    >
      
      {/* Theme Dropdown Pill */}
      <SettingRow 
        title="Theme" 
        description="Pick a color palette for the entire interface."
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-xs sm:text-sm text-white transition-colors cursor-pointer shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
          <span className="font-medium">{theme}</span>
          <ChevronDown className="w-3.5 h-3.5 text-white/70 ml-0.5" />
        </div>
      </SettingRow>

      {/* Segmented Control 1: Study View Style */}
      <SettingRow 
        title="Study View Style" 
        description="Choose how chapters and topics appear on syllabus pages."
      >
        <div className="flex items-center p-1 rounded-full bg-white/[0.08] border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => setViewStyle("carousel")}
            className={cn(
              "px-4 py-1 text-xs font-semibold rounded-full transition-all duration-200",
              viewStyle === "carousel"
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:text-white"
            )}
          >
            Carousel
          </button>
          <button
            type="button"
            onClick={() => setViewStyle("grid")}
            className={cn(
              "px-4 py-1 text-xs font-semibold rounded-full transition-all duration-200",
              viewStyle === "grid"
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:text-white"
            )}
          >
            Grid
          </button>
        </div>
      </SettingRow>

      {/* Segmented Control 2: Detail View Type */}
      <SettingRow 
        title="Detail View Type" 
        description="Pick between a full page or a compact modal."
      >
        <div className="flex items-center p-1 rounded-full bg-white/[0.08] border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => setDetailType("page")}
            className={cn(
              "px-4 py-1 text-xs font-semibold rounded-full transition-all duration-200",
              detailType === "page"
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:text-white"
            )}
          >
            Page
          </button>
          <button
            type="button"
            onClick={() => setDetailType("modal")}
            className={cn(
              "px-4 py-1 text-xs font-semibold rounded-full transition-all duration-200",
              detailType === "modal"
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:text-white"
            )}
          >
            Modal
          </button>
        </div>
      </SettingRow>

      {/* iOS Toggle 1: Use Image Formulas */}
      <SettingRow 
        title="Use Image Formulas" 
        description="Display high-yield formula anchors on topic preview cards."
      >
        <PremiumSwitch 
          checked={useFormulas} 
          onChange={setUseFormulas} 
        />
      </SettingRow>

      {/* iOS Toggle 2: Audio / Video Solutions */}
      <SettingRow 
        title="Solution Previews" 
        description="Play step-by-step video solutions and hints automatically on hover."
        isLast
      >
        <PremiumSwitch 
          checked={autoAudio} 
          onChange={setAutoAudio} 
        />
      </SettingRow>

    </GlassSection>
  );
}
