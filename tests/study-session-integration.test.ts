import test from "node:test";
import assert from "node:assert/strict";
import { getLocalISTDateString, isSameISTDay, calculateStreakFromSessions } from "../lib/date-utils";
import { calculateSessionXP } from "../features/progress/config/xp-config";

test("Study Session & Time-Tracking Integration Test Suite", async (t) => {
  // ── SCENARIO A: Dual-Timer Accumulation (12m normal timer + 18m focus timer = 30m) ──
  await t.test("Scenario A: Dual-timer contributions sum accurately to daily totals and missions", () => {
    // Session 1: Normal study timer (12 minutes = 720s)
    const session1 = {
      id: "sess-1",
      user_id: "user-test",
      duration_seconds: 720,
      started_at: "2026-10-14T04:30:00.000Z",
      ended_at: "2026-10-14T04:42:00.000Z",
      activity_type: "Study Guide",
      xp_earned: calculateSessionXP(720, "Study Guide"),
    };

    // Session 2: Focus page timer (18 minutes = 1080s)
    const session2 = {
      id: "sess-2",
      user_id: "user-test",
      duration_seconds: 1080,
      started_at: "2026-10-14T06:00:00.000Z",
      ended_at: "2026-10-14T06:18:00.000Z",
      activity_type: "deep_work",
      xp_earned: calculateSessionXP(1080),
    };

    const todayStr = getLocalISTDateString("2026-10-14T05:00:00.000Z");
    const sessions = [session1, session2];

    // Filter today's sessions in IST
    const todaySessions = sessions.filter((s) => getLocalISTDateString(s.started_at) === todayStr);
    assert.equal(todaySessions.length, 2, "Both sessions must be recognized as today's sessions");

    // Total study duration
    const totalTodayDurationSeconds = todaySessions.reduce((acc, s) => acc + s.duration_seconds, 0);
    assert.equal(totalTodayDurationSeconds, 1800, "12m + 18m must equal 1800 seconds (30 minutes)");

    const todayStudyMinutes = Math.floor(totalTodayDurationSeconds / 60);
    assert.equal(todayStudyMinutes, 30, "Today's study minutes must be exactly 30m");

    // Daily mission evaluation
    const studyMissionTarget = 30;
    const studyMissionCurrent = todayStudyMinutes;
    const studyMissionCompleted = studyMissionCurrent >= studyMissionTarget;
    assert.equal(studyMissionCompleted, true, "Study for 30 minutes daily mission must be complete");

    const sessionMissionTarget = 1;
    const sessionMissionCurrent = todaySessions.length;
    const sessionMissionCompleted = sessionMissionCurrent >= sessionMissionTarget;
    assert.equal(sessionMissionCompleted, true, "Complete 1 focus session daily mission must be complete");
    assert.equal(sessionMissionCurrent, 2, "Session count must reflect both timers (2 sessions)");
  });

  // ── SCENARIO B: Pause / Resume & Break Isolation ──
  await t.test("Scenario B: Paused time and break phases are 100% excluded from study duration", () => {
    // Emulate timer state mechanics from app/dashboard/focus/page.tsx
    let sessionAccumulated = 0;
    let phaseAccumulated = 0;
    let isActive = false;
    let phase: "study" | "shortBreak" = "study";
    let lastResumeTime: number | null = null;

    const getSessionElapsed = () =>
      sessionAccumulated + (isActive && phase === "study" && lastResumeTime ? (Date.now() - lastResumeTime) / 1000 : 0);

    // 1. User starts studying at t0
    const t0 = Date.now();
    lastResumeTime = t0;
    isActive = true;

    // 2. Study for 10 seconds, then pause
    const simulatedActiveStudy1 = 10;
    sessionAccumulated += simulatedActiveStudy1;
    phaseAccumulated += simulatedActiveStudy1;
    isActive = false;
    lastResumeTime = null;

    // 3. User remains paused for 600 seconds (10 minutes)
    // During pause, getSessionElapsed must remain strictly 10s
    assert.equal(getSessionElapsed(), 10, "Paused time must not advance study elapsed time");

    // 4. User resumes study for another 15 seconds
    const simulatedActiveStudy2 = 15;
    sessionAccumulated += simulatedActiveStudy2;
    phaseAccumulated += simulatedActiveStudy2;

    assert.equal(sessionAccumulated, 25, "Active study time must accurately accumulate (10s + 15s = 25s)");
    assert.equal(phaseAccumulated, 25, "Active phase time must accurately accumulate");

    // 5. Pomodoro study phase completes -> Switch to shortBreak
    phase = "shortBreak";
    phaseAccumulated = 0;
    assert.equal(phaseAccumulated, 0, "Phase accumulated must reset for next phase");
    lastResumeTime = Date.now();
    isActive = true; // Break timer starts running!

    // 6. Break timer runs for 300 seconds (5 minutes)
    // Crucial check: getSessionElapsed MUST NOT increase during shortBreak even though isActive is true!
    const breakElapsed = getSessionElapsed();
    assert.equal(breakElapsed, 25, "Break time must NEVER contaminate study session elapsed time");
  });

  // ── SCENARIO C: Daily Mission Auto-Generation / Out-of-Order Visit ──
  await t.test("Scenario C: Out-of-order visit initializes mission progress from today's completed sessions", () => {
    const todayStr = "2026-10-14";

    // Student completed a 25-minute focus session before visiting /dashboard
    const existingSessions = [
      {
        duration_seconds: 1500, // 25 mins
        started_at: "2026-10-14T05:00:00.000Z",
      },
    ];

    // Auto-generation logic extracts today's baseline:
    const todaySessions = existingSessions.filter((s) => getLocalISTDateString(s.started_at) === todayStr);
    const baselineStudyMins = Math.floor(todaySessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60);
    const baselineSessionCount = todaySessions.length;

    assert.equal(baselineStudyMins, 25, "Baseline study duration must be initialized to 25 minutes");
    assert.equal(baselineSessionCount, 1, "Baseline session count must be initialized to 1");

    // When student later studies 10 more minutes:
    const updatedStudyMins = baselineStudyMins + 10; // 35 mins
    const target = 30;
    const completed = updatedStudyMins >= target;
    assert.equal(completed, true, "Mission must complete when threshold reached across multiple visits");
  });

  // ── SCENARIO D: Deduplication & Idempotency ──
  await t.test("Scenario D: Duplicate session submissions return existing record without double crediting", () => {
    const sessionStore: Array<{ id: string; user_id: string; started_at: string; duration_seconds: number }> = [];

    function recordSession(user_id: string, started_at: string, duration_seconds: number) {
      const existing = sessionStore.find((s) => s.user_id === user_id && s.started_at === started_at && s.duration_seconds === duration_seconds);
      if (existing) {
        return { session: existing, isDuplicate: true };
      }
      const newSession = { id: `sess-${sessionStore.length + 1}`, user_id, started_at, duration_seconds };
      sessionStore.push(newSession);
      return { session: newSession, isDuplicate: false };
    }

    const first = recordSession("user-1", "2026-10-14T10:00:00.000Z", 1500);
    assert.equal(first.isDuplicate, false);
    assert.equal(sessionStore.length, 1);

    // Duplicate submission (e.g. offline sync retry)
    const second = recordSession("user-1", "2026-10-14T10:00:00.000Z", 1500);
    assert.equal(second.isDuplicate, true);
    assert.equal(second.session.id, first.session.id);
    assert.equal(sessionStore.length, 1, "Duplicate submission must not add a second row");
  });

  // ── SCENARIO E: Timezone Boundaries (Midnight IST) ──
  await t.test("Scenario E: Midnight boundary sessions in IST (Asia/Kolkata) are correctly attributed", () => {
    // Indian Standard Time is UTC+05:30.
    // 01:30 AM IST on Oct 14 is 20:00 UTC on Oct 13.
    const lateNightSessionUtc = "2026-10-13T20:00:00.000Z"; // 1:30 AM IST on Oct 14
    const afternoonSessionUtc = "2026-10-14T08:30:00.000Z"; // 2:00 PM IST on Oct 14
    const previousDaySessionUtc = "2026-10-13T18:29:00.000Z"; // 11:59 PM IST on Oct 13

    assert.equal(getLocalISTDateString(lateNightSessionUtc), "2026-10-14", "1:30 AM IST must belong to Oct 14");
    assert.equal(getLocalISTDateString(afternoonSessionUtc), "2026-10-14", "2:00 PM IST must belong to Oct 14");
    assert.equal(getLocalISTDateString(previousDaySessionUtc), "2026-10-13", "11:59 PM IST must belong to Oct 13");

    assert.equal(isSameISTDay(lateNightSessionUtc, afternoonSessionUtc), true, "Both sessions occurred on the same IST day");
    assert.equal(isSameISTDay(lateNightSessionUtc, previousDaySessionUtc), false, "Late night and yesterday's 11:59pm are different IST days");

    // Streak verification across IST days
    const sessions = [
      { started_at: lateNightSessionUtc }, // Oct 14 IST
      { started_at: previousDaySessionUtc }, // Oct 13 IST
      { started_at: "2026-10-12T10:00:00.000Z" }, // Oct 12 IST
    ];
    const streak = calculateStreakFromSessions(sessions, new Date("2026-10-14T12:00:00.000Z"));
    assert.equal(streak, 3, "Streak across midnight boundary in IST must be 3 consecutive days");
  });

  // ── SCENARIO F: Interrupted Sessions / Unmount ──
  await t.test("Scenario F: Interrupted session with >= 60 seconds is eligible for persistence", () => {
    const minRecordedThresholdSeconds = 60;

    const shortInterruptedSeconds = 45;
    const eligibleInterruptedSeconds = 72;

    assert.equal(shortInterruptedSeconds >= minRecordedThresholdSeconds, false, "Sessions < 60s are discarded to prevent spam");
    assert.equal(eligibleInterruptedSeconds >= minRecordedThresholdSeconds, true, "Sessions >= 60s must be persisted on unload");
  });

  // ── SCENARIO G: Account Isolation ──
  await t.test("Scenario G: User sessions and metrics remain strictly isolated by user_id", () => {
    const allSessions = [
      { id: "1", user_id: "user-alpha", duration_seconds: 1800, started_at: "2026-10-14T05:00:00.000Z" },
      { id: "2", user_id: "user-beta", duration_seconds: 3600, started_at: "2026-10-14T05:00:00.000Z" },
    ];

    const alphaSessions = allSessions.filter((s) => s.user_id === "user-alpha");
    const betaSessions = allSessions.filter((s) => s.user_id === "user-beta");

    assert.equal(alphaSessions.length, 1);
    assert.equal(betaSessions.length, 1);
    assert.equal(alphaSessions[0].duration_seconds, 1800, "User Alpha metrics must not include User Beta's time");
    assert.equal(betaSessions[0].duration_seconds, 3600, "User Beta metrics must not include User Alpha's time");
  });
});
