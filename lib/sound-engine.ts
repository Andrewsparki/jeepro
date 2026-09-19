"use client";

import { playHapticSound, SoundType } from "./sound-effects";

export type SemanticSoundEvent =
  // UI Interactions
  | "ui.hover"
  | "ui.click"
  | "ui.press"
  | "ui.open"
  | "ui.close"
  | "ui.select"
  | "ui.toggleOn"
  | "ui.toggleOff"
  | "ui.checkbox"
  | "ui.tab"
  | "ui.dropdown"
  | "ui.contextMenu"
  | "ui.navigation"
  | "ui.search"
  | "ui.modal"

  // Feedback States
  | "feedback.success"
  | "feedback.error"
  | "feedback.warning"
  | "feedback.notification"

  // Progression & Gamification
  | "progression.xpGain"
  | "progression.levelUp"
  | "progression.achievementUnlock"
  | "progression.milestone"
  | "progression.questComplete"

  // Study & Focus Engine
  | "study.focusStart"
  | "study.focusPause"
  | "study.focusResume"
  | "study.focusComplete"
  | "study.topicComplete"
  | "study.chapterComplete"
  | "study.bookmark"
  | "study.sessionStart"
  | "study.sessionEnd"

  // Social & Community
  | "social.messageSent"
  | "social.messageReceived"
  | "social.friendRequest"
  | "social.friendAccepted"
  | "social.reportSubmitted"
  | "social.groupJoin"

  // Planner
  | "planner.eventCreate"
  | "planner.eventComplete"
  | "planner.eventDelete"

  // Settings
  | "settings.save"
  | "settings.reset";

const EVENT_MAP: Record<SemanticSoundEvent, SoundType> = {
  "ui.hover": "tick",
  "ui.click": "click",
  "ui.press": "soft-tap",
  "ui.open": "pop-up",
  "ui.close": "pop-down",
  "ui.select": "liquid-glass",
  "ui.toggleOn": "toggleOn",
  "ui.toggleOff": "toggleOff",
  "ui.checkbox": "tick",
  "ui.tab": "nav-drop",
  "ui.dropdown": "nav-drop",
  "ui.contextMenu": "pop-up",
  "ui.navigation": "nav-drop",
  "ui.search": "pop-up",
  "ui.modal": "pop-up",

  "feedback.success": "success",
  "feedback.error": "muted-error",
  "feedback.warning": "danger",
  "feedback.notification": "notification",

  "progression.xpGain": "xp-up",
  "progression.levelUp": "celebration",
  "progression.achievementUnlock": "chime",
  "progression.milestone": "celebration",
  "progression.questComplete": "success",

  "study.focusStart": "pop-up",
  "study.focusPause": "pop-down",
  "study.focusResume": "pop-up",
  "study.focusComplete": "celebration",
  "study.topicComplete": "success",
  "study.chapterComplete": "celebration",
  "study.bookmark": "liquid-glass",
  "study.sessionStart": "chime",
  "study.sessionEnd": "chime",

  "social.messageSent": "message-sent",
  "social.messageReceived": "message-received",
  "social.friendRequest": "pop-up",
  "social.friendAccepted": "chime",
  "social.reportSubmitted": "danger",
  "social.groupJoin": "chime",

  "planner.eventCreate": "pop-up",
  "planner.eventComplete": "success",
  "planner.eventDelete": "danger",

  "settings.save": "success",
  "settings.reset": "danger",
};

// Rate limiting & debouncing cache
const lastTriggeredTimes: Map<string, number> = new Map();
const COOLDOWN_MS: Record<string, number> = {
  "ui.hover": 70,
  "ui.click": 30,
  "ui.tick": 30,
  "ui.tab": 50,
};

let audioUnlocked = false;

function unlockAudioContext() {
  if (audioUnlocked || typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const dummyCtx = new AudioCtx();
      if (dummyCtx.state === "suspended") {
        dummyCtx.resume().catch(() => {});
      }
    }
    audioUnlocked = true;
  } catch {
    // Ignore audio context errors
  }
}

// Global listener to unlock audio on first user gesture
if (typeof window !== "undefined") {
  const unlockEvents = ["pointerdown", "keydown", "touchstart"];
  const handleFirstInteraction = () => {
    unlockAudioContext();
    unlockEvents.forEach((evt) => window.removeEventListener(evt, handleFirstInteraction));
  };
  unlockEvents.forEach((evt) => window.addEventListener(evt, handleFirstInteraction, { passive: true }));
}

export function dispatchInteractionSound(
  event: SemanticSoundEvent,
  enabled: boolean = true
) {
  if (!enabled || typeof window === "undefined") return;

  const now = Date.now();
  const cooldown = COOLDOWN_MS[event] || 20;
  const lastTime = lastTriggeredTimes.get(event) || 0;

  if (now - lastTime < cooldown) {
    return;
  }
  lastTriggeredTimes.set(event, now);

  const soundType = EVENT_MAP[event] || "click";
  playHapticSound(soundType, enabled);
}
