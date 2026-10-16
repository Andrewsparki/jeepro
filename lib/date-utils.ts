/**
 * Centralized Date & Timezone Utilities for JEE Pro.
 * Enforces consistent "Asia/Kolkata" (IST) calendar day calculations across
 * Dashboard metrics, Daily Missions, streaks, and study session attribution.
 */

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

/**
 * Returns a 'YYYY-MM-DD' date string for a given Date or ISO string in Indian Standard Time (IST).
 */
export function getLocalISTDateString(dateInput: Date | string = new Date()): string {
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) {
      return getLocalISTDateString(new Date());
    }
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: DEFAULT_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

/**
 * Checks whether two dates fall on the same calendar day in IST.
 */
export function isSameISTDay(dateA: Date | string, dateB: Date | string): boolean {
  return getLocalISTDateString(dateA) === getLocalISTDateString(dateB);
}

/**
 * Checks whether a given timestamp belongs to today in IST.
 */
export function isTodayIST(dateInput: Date | string): boolean {
  return isSameISTDay(dateInput, new Date());
}

/**
 * Calculates consecutive daily study streak in IST.
 * If the user has studied today, the streak counts today + consecutive previous days.
 * If the user has not studied today yet, the streak checks yesterday to preserve active streak.
 */
export function calculateStreakFromSessions(
  sessions: { started_at: string }[],
  referenceDate: Date | string = new Date()
): number {
  if (!sessions || sessions.length === 0) return 0;

  const uniqueStudyDays = new Set<string>();
  for (const s of sessions) {
    if (s.started_at) {
      uniqueStudyDays.add(getLocalISTDateString(s.started_at));
    }
  }

  const ref = typeof referenceDate === "string" ? new Date(referenceDate) : new Date(referenceDate.getTime());
  const currentRef = new Date(ref.getTime());
  let todayStr = getLocalISTDateString(currentRef);

  // If user hasn't studied today, anchor to yesterday
  if (!uniqueStudyDays.has(todayStr)) {
    currentRef.setDate(currentRef.getDate() - 1);
    todayStr = getLocalISTDateString(currentRef);
    if (!uniqueStudyDays.has(todayStr)) {
      return 0;
    }
  }

  let streak = 0;
  while (true) {
    const dateStr = getLocalISTDateString(currentRef);
    if (uniqueStudyDays.has(dateStr)) {
      streak++;
      currentRef.setDate(currentRef.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
