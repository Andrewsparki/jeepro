export type AnalyticsEventType =
  | "page_view"
  | "feature_use"
  | "study_start"
  | "study_complete"
  | "session_end"
  | "focus_start"
  | "focus_complete"
  | "syllabus_view"
  | "chapter_open"
  | "formula_interact"
  | "notes_save"
  | "search_query"
  | "onboarding_step"
  | "engagement_time"
  | "client_error";

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  path: string;
  referrer?: string;
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet";
  timestamp: string; // ISO string
  feature?: string;
  /** Pseudonymous per-browser-session identifier (not tied to user identity) */
  sessionId?: string;
  /** Non-reversible truncated pseudonym for user cohort analysis (e.g. u-3f9a81b2) */
  userPseudonym?: string;
  /** Active engagement duration in seconds for engagement_time events */
  durationSeconds?: number;
  /** Additional sanitized event metadata (no personal or sensitive data) */
  metadata?: Record<string, unknown>;
}

export interface RouteEngagementStat {
  path: string;
  feature: string;
  totalSeconds: number;
  avgSecondsPerVisit: number;
  visitCount: number;
}

export interface FeatureEngagementStat {
  feature: string;
  totalSeconds: number;
  visitCount: number;
  percentage: number;
}

export interface DailyEngagementTrend {
  date: string; // YYYY-MM-DD
  totalSeconds: number;
  activeSessions: number;
}

export interface FunnelStep {
  name: string;
  count: number;
  dropoffRate: number; // percentage
}

export interface RetentionCohort {
  cohortDate: string; // YYYY-MM
  size: number;
  retentionRates: number[]; // Day 1, Day 3, Day 7, Day 14, Day 30 percentage
}

export interface ClientErrorStat {
  message: string;
  count: number;
  lastSeen: string;
  path: string;
}

export interface AnalyticsSummary {
  totalPageViews: number;
  uniqueSessions: number;
  /** Number of distinct sessions with activity in the last 5 minutes */
  activeSessions: number;
  /** Total active engagement time across all consented sessions in seconds */
  totalEngagementSeconds: number;
  /** Average active engagement seconds per visit */
  avgEngagementSecondsPerVisit: number;
  popularPages: { path: string; count: number }[];
  popularFeatures: { feature: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  /** Breakdown of active time spent on individual routes */
  routeEngagement: RouteEngagementStat[];
  /** Breakdown of active time spent across major features */
  featureEngagement: FeatureEngagementStat[];
  /** Day-by-day engagement trend */
  engagementTrends: DailyEngagementTrend[];
  /** Funnel drop-off analytics */
  onboardingFunnel: FunnelStep[];
  studyWorkflowFunnel: FunnelStep[];
  /** Weekly / Monthly cohort retention */
  retentionCohorts: RetentionCohort[];
  /** Client-side error tracking telemetry */
  errorStats: ClientErrorStat[];
  recentEvents: AnalyticsEvent[];
  retentionDays: number;
}

export interface UserTelemetryInsight {
  userPseudonym: string;
  firstSeen: string;
  lastSeen: string;
  totalSessions: number;
  totalEngagementSeconds: number;
  topFeatures: { feature: string; durationSeconds: number; count: number }[];
  recentActivity: AnalyticsEvent[];
  errorsEncountered: number;
}

