export type CookieCategory = "essential" | "analytics" | "preferences";

export interface CookieConsentPreferences {
  essential: true; // Always true, cannot be disabled
  analytics: boolean; // Optional tracking/usage telemetry
  preferences: boolean; // UI preferences (theme, audio cues, font sizes)
  timestamp: string;
  version: string;
}

export const CONSENT_COOKIE_NAME = "jee_cookie_consent_v1";
export const CONSENT_VERSION = "1.0.0";

export const DEFAULT_CONSENT_PREFERENCES: CookieConsentPreferences = {
  essential: true,
  analytics: false,
  preferences: true,
  timestamp: "",
  version: CONSENT_VERSION,
};

/**
 * Cookie details used across JEE Pro for complete transparency.
 */
export interface CookieDeclaration {
  name: string;
  category: CookieCategory;
  provider: string;
  purpose: string;
  expiry: string;
}

export const COOKIE_DECLARATIONS: CookieDeclaration[] = [
  {
    name: "sb-*-auth-token",
    category: "essential",
    provider: "Supabase (Self-hosted / Cloud)",
    purpose: "Maintains cryptographically signed authentication sessions across pages.",
    expiry: "Session / 1 Year (Refresh token)",
  },
  {
    name: "jee_cookie_consent_v1",
    category: "essential",
    provider: "JEE Pro",
    purpose: "Stores your explicit cookie consent and tracking preferences.",
    expiry: "1 Year",
  },
  {
    name: "jee_theme / theme",
    category: "preferences",
    provider: "JEE Pro",
    purpose: "Preserves your visual workspace theme (Obsidian / Midnight / Titanium).",
    expiry: "Persistent (Local Storage)",
  },
  {
    name: "jee_sound_enabled / volume",
    category: "preferences",
    provider: "JEE Pro",
    purpose: "Remembers your sound engine preferences and study audio cues.",
    expiry: "Persistent (Local Storage)",
  },
  {
    name: "jee_analytics_session",
    category: "analytics",
    provider: "JEE Pro Internal Telemetry",
    purpose: "Collects privacy-conscious page views and feature usage without personal identification.",
    expiry: "Session / 30 Days",
  },
];
