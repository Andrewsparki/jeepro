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
 * Returns the current calendar year in IST.
 */
export function getISTYear(dateInput: Date | string = new Date()): number {
  const dateStr = getLocalISTDateString(dateInput);
  return parseInt(dateStr.split("-")[0], 10);
}

/**
 * Returns the hour of day (0-23) in IST.
 */
export function getISTHour(dateInput: Date | string = new Date()): number {
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const hourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: DEFAULT_TIMEZONE,
      hour: "numeric",
      hour12: false,
    }).format(date);
    const parsed = parseInt(hourStr, 10);
    return parsed === 24 ? 0 : parsed;
  } catch {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return d.getHours();
  }
}

/**
 * Compares a date-only birthday string (e.g. 'YYYY-MM-DD' or 'MM-DD') with today in IST
 * without UTC drift or timezone parsing artifacts.
 */
export function isBirthdayTodayIST(birthdayStr: string | null | undefined): boolean {
  if (!birthdayStr) return false;
  const parts = birthdayStr.split("-");
  if (parts.length < 2) return false;

  // Handle both 'YYYY-MM-DD' and 'MM-DD'
  const bMonth = parts.length >= 3 ? parseInt(parts[1], 10) : parseInt(parts[0], 10);
  const rawDay = parts.length >= 3 ? parts[2] : parts[1];
  const bDay = parseInt(rawDay.slice(0, 2), 10);

  if (isNaN(bMonth) || isNaN(bDay)) return false;

  const todayStr = getLocalISTDateString();
  const todayParts = todayStr.split("-");
  const todayMonth = parseInt(todayParts[1], 10);
  const todayDay = parseInt(todayParts[2], 10);

  return bMonth === todayMonth && bDay === todayDay;
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
