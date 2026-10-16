import { NextRequest, NextResponse } from "next/server";
import { AnalyticsEvent } from "@/features/analytics/types/analytics.types";
import {
  recordAnalyticsEvent,
  getAnalyticsSummary,
  getUserTelemetryInsight,
} from "@/features/analytics/services/server-analytics.service";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AnalyticsEvent>;

    if (!body || !body.type || !body.path) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const cleanPath = String(body.path).slice(0, 200);

    // STRICT CENTRAL ADMIN EXCLUSION:
    // Drop all events for administrative routes to avoid polluting normal user usage stats
    if (cleanPath.startsWith("/admin")) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // Sanitize event: NO email, NO password, NO tokens, NO IP addresses
    const cleanEvent: AnalyticsEvent = {
      id: body.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: body.type,
      path: cleanPath,
      referrer: body.referrer ? String(body.referrer).slice(0, 200) : undefined,
      browser: String(body.browser || "Unknown").slice(0, 50),
      os: String(body.os || "Unknown").slice(0, 50),
      deviceType: body.deviceType === "mobile" || body.deviceType === "tablet" ? body.deviceType : "desktop",
      timestamp: body.timestamp || new Date().toISOString(),
      feature: body.feature ? String(body.feature).slice(0, 100) : undefined,
      sessionId: body.sessionId ? String(body.sessionId).slice(0, 64) : undefined,
      userPseudonym: body.userPseudonym ? String(body.userPseudonym).slice(0, 32) : undefined,
      durationSeconds:
        typeof body.durationSeconds === "number" && !isNaN(body.durationSeconds)
          ? Math.max(1, Math.min(3600, Math.round(body.durationSeconds)))
          : undefined,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    };

    recordAnalyticsEvent(cleanEvent);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "all"; // 'today' | '7d' | '30d' | 'all'
  const filterUserPseudonym = url.searchParams.get("userPseudonym");

  // If requesting specific user telemetry insights
  if (filterUserPseudonym) {
    const insights = getUserTelemetryInsight(filterUserPseudonym);
    return NextResponse.json(insights);
  }

  const summary = getAnalyticsSummary(range);
  return NextResponse.json(summary);
}
