"use client";

import { usePerformance, PerformanceMode } from "@/lib/performance-context";
import { Zap, Gauge, BatteryLow, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES: {
  id: PerformanceMode;
  label: string;
  description: string;
  icon: typeof Zap;
  features: string[];
}[] = [
  {
    id: "premium",
    label: "Premium",
    description: "Maximum visual fidelity. Full blur, particles, lighting, and smooth scrolling.",
    icon: Zap,
    features: [
      "Full backdrop blur",
      "Floating particles",
      "Mouse-follow lighting",
      "Smooth scrolling",
      "Magnetic buttons",
      "3D card tilt",
    ],
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Reduced effects for better FPS. Same appearance, less GPU load.",
    icon: Gauge,
    features: [
      "Solid backgrounds (no blur)",
      "Fewer particles",
      "Mouse-follow lighting",
      "Smooth scrolling",
      "Standard buttons",
      "Flat cards",
    ],
  },
  {
    id: "battery-saver",
    label: "Battery Saver",
    description: "Minimal effects for maximum battery life. Still beautiful.",
    icon: BatteryLow,
    features: [
      "No particles",
      "No blur",
      "Native scrolling",
      "Static background",
      "Standard buttons",
      "No animations",
    ],
  },
];

export default function SettingsPage() {
  const { mode, setMode } = usePerformance();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Performance Mode Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Performance</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose how JEE Pro renders animations and effects.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {MODES.map((m) => {
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                  "relative flex flex-col items-start text-left p-5 rounded-2xl border-2 transition-all duration-200",
                  isActive
                    ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    : "border-glass-border bg-surface hover:border-glass-border hover:bg-surface-hover"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}

                <div
                  className={cn(
                    "p-2.5 rounded-xl mb-3",
                    isActive ? "bg-primary/10 text-primary" : "bg-surface-hover text-muted-foreground"
                  )}
                >
                  <m.icon className="w-5 h-5" />
                </div>

                <h3 className="font-semibold mb-1">{m.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {m.description}
                </p>

                <ul className="space-y-1.5 w-full">
                  {m.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      {/* Account section placeholder */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account details.
          </p>
        </div>
        <div className="rounded-xl border border-glass-border bg-surface p-6">
          <p className="text-sm text-muted-foreground">Account settings coming soon.</p>
        </div>
      </section>
    </div>
  );
}
