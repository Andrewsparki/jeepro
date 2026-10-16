import { hasAnalyticsConsent } from "@/features/privacy/services/cookie-consent.service";
import { AnalyticsEvent, AnalyticsEventType } from "../types/analytics.types";

const LOCAL_ANALYTICS_QUEUE_KEY = "jee_analytics_events_buffer_v1";
const MAX_LOCAL_EVENTS = 200;

/**
 * Stable, per-browser-profile identifier stored in localStorage.
 * Shared across all tabs in the same browser profile so multiple tabs
 * belonging to the same user are never double-counted as separate sessions.
 */
const BROWSER_ID_KEY = "jee_analytics_browser_id";

function getOrCreateBrowserId(): string {
  if (typeof window === "undefined") return "ssr";

  try {
    let bid = localStorage.getItem(BROWSER_ID_KEY);
    if (bid) return bid;

    // Generate an opaque random ID — contains zero personal data
    bid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `b-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    localStorage.setItem(BROWSER_ID_KEY, bid);
    return bid;
  } catch {
    // localStorage blocked — return an ephemeral ID
    return `b-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Builds the composite session identifier: `browserId::userPseudonym`.
 *
 * - Same browser profile + same authenticated user → identical sessionId across
 *   all tabs and page views → counted as 1 active session.
 * - Different browser profile OR different user → different sessionId →
 *   counted as separate sessions.
 */
function buildSessionId(userPseudonym?: string): string {
  const browserId = getOrCreateBrowserId();
  const scope = userPseudonym || "anon";
  return `${browserId}::${scope}`;
}

/**
 * Produces a short, privacy-safe pseudonym from a Supabase user UUID.
 * Not reversible — simply truncates to the first 12 hex characters,
 * which gives 48 bits of collision resistance without leaking the full user ID.
 */
export function pseudonymiseUserId(userId: string): string {
  if (!userId) return "anon";
  return userId.replace(/-/g, "").slice(0, 12);
}

/**
 * Maps application paths to canonical feature names for high-level engagement analytics.
 */
export function resolveFeatureName(path: string): string {
  if (!path) return "General";
  const p = path.toLowerCase();

  // Explicitly ignore administrative routes
  if (p.startsWith("/admin")) return "Admin (Excluded)";

  if (p === "/" || p.startsWith("/about") || p.startsWith("/pricing") || p.startsWith("/privacy")) {
    return "Marketing & Landing";
  }
  if (p === "/dashboard") return "Dashboard";
  if (p.startsWith("/dashboard/analytics")) return "Personal Analytics";
  if (p.startsWith("/dashboard/support")) return "Support Desk";
  if (p.startsWith("/study")) return "Study Workspace";
  if (p.startsWith("/focus")) return "Focus Mode";
  if (p.startsWith("/syllabus")) return "Syllabus Browser";
  if (p.startsWith("/planner")) return "Planner";
  if (p.startsWith("/history")) return "Practice History";
  if (p.startsWith("/achievements")) return "Achievements";
  if (p.startsWith("/leaderboard")) return "Leaderboard";
  if (p.startsWith("/chat")) return "Global Chat";
  if (p.startsWith("/friends")) return "Friends Network";
  if (p.startsWith("/groups")) return "Study Groups";
  if (p.startsWith("/settings")) return "Settings";
  if (p.startsWith("/login") || p.startsWith("/signup") || p.startsWith("/auth")) return "Authentication";

  return "Application Core";
}

function parseUserAgent(): { browser: string; os: string; deviceType: "desktop" | "mobile" | "tablet" } {
  if (typeof window === "undefined" || !navigator?.userAgent) {
    return { browser: "Unknown", os: "Unknown", deviceType: "desktop" };
  }

  const ua = navigator.userAgent;
  let browser = "Other";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";

  let os = "Other";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";
  if (/iPad|tablet/i.test(ua)) deviceType = "tablet";
  else if (/Mobile|Android|iPhone/i.test(ua)) deviceType = "mobile";

  return { browser, os, deviceType };
}

/**
 * Dispatches a privacy-conscious analytics event to the server.
 * Silently drops if the visitor has NOT explicitly granted consent for optional analytics,
 * or if the current route is an administrative `/admin/*` route.
 */
export async function trackEvent(
  type: AnalyticsEventType,
  path?: string,
  extra?: { feature?: string; metadata?: Record<string, unknown>; userPseudonym?: string; durationSeconds?: number }
): Promise<void> {
  if (typeof window === "undefined") return;

  // STRICT CONSENT GATE
  if (!hasAnalyticsConsent()) {
    return;
  }

  const currentPath = path || window.location.pathname;

  // STRICT ADMIN EXCLUSION: Never track admin navigation or actions into public usage analytics
  if (currentPath.startsWith("/admin")) {
    return;
  }

  const { browser, os, deviceType } = parseUserAgent();
  const feature = extra?.feature || resolveFeatureName(currentPath);

  const eventPayload: AnalyticsEvent = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}`,
    type,
    path: currentPath,
    referrer: document.referrer ? new URL(document.referrer, window.location.href).pathname : undefined,
    browser,
    os,
    deviceType,
    timestamp: new Date().toISOString(),
    feature,
    sessionId: buildSessionId(extra?.userPseudonym),
    userPseudonym: extra?.userPseudonym,
    durationSeconds: extra?.durationSeconds,
    metadata: extra?.metadata,
  };

  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventPayload),
      keepalive: true,
    });
  } catch {
    // Graceful fallback: Buffer locally in browser for offline resilience
    try {
      const raw = localStorage.getItem(LOCAL_ANALYTICS_QUEUE_KEY);
      const list: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
      list.unshift(eventPayload);
      if (list.length > MAX_LOCAL_EVENTS) list.length = MAX_LOCAL_EVENTS;
      localStorage.setItem(LOCAL_ANALYTICS_QUEUE_KEY, JSON.stringify(list));
    } catch {
      // Ignore quota errors
    }
  }
}

/**
 * Records an active engagement time tick for a specific route and feature.
 */
export async function trackEngagement(
  path: string,
  durationSeconds: number,
  feature?: string,
  userPseudonym?: string
): Promise<void> {
  if (!path || durationSeconds <= 0) return;
  if (path.startsWith("/admin")) return;

  await trackEvent("engagement_time", path, {
    feature: feature || resolveFeatureName(path),
    durationSeconds: Math.round(durationSeconds),
    userPseudonym,
  });
}

/**
 * Convenience helper to track client-side errors without logging sensitive PII
 */
export async function trackClientError(
  error: Error | string,
  context?: string,
  userPseudonym?: string
): Promise<void> {
  const message = typeof error === "string" ? error : error.message || "Unknown error";
  await trackEvent("client_error", typeof window !== "undefined" ? window.location.pathname : "/unknown", {
    feature: "Error Monitoring",
    userPseudonym,
    metadata: {
      errorPreview: message.slice(0, 150),
      context: context || "application",
    },
  });
}

/**
 * Tracks search usage with safe sanitized metadata (character count, result count)
 * Never retains raw search strings that could contain personal data or passwords.
 */
export async function trackSearchUsage(
  queryLength: number,
  resultCount: number,
  category?: string,
  userPseudonym?: string
): Promise<void> {
  await trackEvent("search_query", "/search", {
    feature: "Universal Command Palette",
    userPseudonym,
    metadata: {
      queryLength,
      resultCount,
      category: category || "all",
    },
  });
}
