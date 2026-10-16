import {
  CookieConsentPreferences,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  DEFAULT_CONSENT_PREFERENCES,
} from "../types/cookie-consent.types";

/**
 * Checks if the browser has already recorded consent preferences.
 */
export function getStoredConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    // 1. Try localStorage first
    const local = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (local) {
      const parsed = JSON.parse(local) as CookieConsentPreferences;
      if (parsed.version === CONSENT_VERSION) return parsed;
    }

    // 2. Fallback to document.cookie
    const match = document.cookie.match(new RegExp(`(^|;\\s*)(${CONSENT_COOKIE_NAME})=([^;]*)`));
    if (match && match[3]) {
      const parsed = JSON.parse(decodeURIComponent(match[3])) as CookieConsentPreferences;
      if (parsed.version === CONSENT_VERSION) return parsed;
    }
  } catch (e) {
    console.warn("[CookieConsent] Error reading stored preferences:", e);
  }

  return null;
}

/**
 * Persists cookie consent preferences to both document.cookie and localStorage.
 */
export function setStoredConsent(prefs: Partial<CookieConsentPreferences>): CookieConsentPreferences {
  const complete: CookieConsentPreferences = {
    ...DEFAULT_CONSENT_PREFERENCES,
    ...prefs,
    essential: true, // Always enforced
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  if (typeof window !== "undefined") {
    try {
      const serialized = JSON.stringify(complete);
      localStorage.setItem(CONSENT_COOKIE_NAME, serialized);

      // Store in cookie for 365 days, SameSite=Lax, Secure
      const maxAge = 365 * 24 * 60 * 60;
      const isSecure = window.location.protocol === "https:";
      document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(serialized)}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;

      // Dispatch custom window event so all runtime components/trackers react instantly
      window.dispatchEvent(new CustomEvent("jee-cookie-consent-change", { detail: complete }));
    } catch (e) {
      console.warn("[CookieConsent] Error storing preferences:", e);
    }
  }

  return complete;
}

/**
 * Returns true if analytics cookies are explicitly allowed by the user.
 */
export function hasAnalyticsConsent(): boolean {
  const stored = getStoredConsent();
  return Boolean(stored && stored.analytics === true);
}
