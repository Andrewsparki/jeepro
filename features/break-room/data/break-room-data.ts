export interface BrainTeaser {
  id: string;
  question: string;
  hint: string;
  answer: string;
  explanation: string;
  subjectTag: "Physics" | "Mathematics" | "Chemistry" | "Pure Logic";
}

export interface RandomQuest {
  id: string;
  title: string;
  duration: string;
  category: "Physical Reset" | "Mental Recalibration" | "JEE Zen" | "Focus Micro-Habit";
  prompt: string;
  tip: string;
}

export const BRAIN_TEASERS: BrainTeaser[] = [
  {
    id: "teaser-1",
    question: "A frictionless pendulum oscillates in a vacuum chamber on Earth. If the entire apparatus is placed in an elevator in free-fall, what is the frequency of oscillation?",
    hint: "Recall the effective acceleration due to gravity in a freely falling reference frame.",
    answer: "Zero (it ceases to oscillate).",
    explanation: "In free-fall, the effective gravity g_eff = g - g = 0. Since T = 2π√(L/g_eff), the period tends to infinity, meaning oscillation ceases entirely.",
    subjectTag: "Physics"
  },
  {
    id: "teaser-2",
    question: "You have two identical ropes. Burning each rope from one end to the other takes exactly 60 minutes, but the ropes burn at non-uniform rates. How do you measure exactly 45 minutes using only these two ropes and a lighter?",
    hint: "Think about lighting both ends of a rope simultaneously.",
    answer: "Light both ends of rope 1 and one end of rope 2. When rope 1 finishes (30m), light the other end of rope 2.",
    explanation: "Rope 1 lit at both ends finishes in 30 minutes. At that exact moment, rope 2 has 30 minutes of burn time remaining. Lighting its other end burns the remaining half in 15 minutes: 30 + 15 = 45 minutes.",
    subjectTag: "Pure Logic"
  },
  {
    id: "teaser-3",
    question: "If f(x + y) = f(x) · f(y) for all real x, y with f(0) ≠ 0 and f'(0) = 2, what is f'(x) in terms of f(x)?",
    hint: "Use the first-principles definition of derivative: f'(x) = lim_{h->0} [f(x+h) - f(x)] / h.",
    answer: "f'(x) = 2f(x)",
    explanation: "f'(x) = lim_{h->0} [f(x)(f(h) - 1)]/h. Since f(0) = f(0+0) = f(0)^2 and f(0) ≠ 0, f(0) = 1. Thus f'(0) = lim [f(h)-1]/h = 2. Hence f'(x) = 2f(x).",
    subjectTag: "Mathematics"
  },
  {
    id: "teaser-4",
    question: "A 100 kg bag of cucumbers is 99% water by mass. After resting under the summer sun, some water evaporates, reducing the water content to 98% by mass. What is the new total mass of the cucumbers?",
    hint: "The non-water dry solid mass does not evaporate.",
    answer: "50 kg",
    explanation: "Initially, dry solid mass = 1% of 100 kg = 1 kg. After evaporation, the solid is 100% - 98% = 2% of total mass M. Therefore 0.02 · M = 1 kg ⟹ M = 50 kg.",
    subjectTag: "Chemistry"
  },
  {
    id: "teaser-5",
    question: "A fly travels between two trains speeding toward each other on the same track. Each train moves at 50 km/h, starting 100 km apart. The fly zips back and forth at 75 km/h until the collision. What total distance does the fly fly?",
    hint: "Don't sum an infinite geometric series — calculate the total collision time first.",
    answer: "75 km",
    explanation: "Relative speed of trains = 100 km/h. They meet in exactly 1 hour. In that 1 hour, the fly travelling at 75 km/h covers 75 km.",
    subjectTag: "Physics"
  },
  {
    id: "teaser-6",
    question: "Can an integer with 2026 ones and no other non-zero digits (i.e. 111...11) ever be a perfect square?",
    hint: "Look at the remainder when a number is divided by 4.",
    answer: "No, never.",
    explanation: "Any number ending in ...11 leaves a remainder of 3 when divided by 4 (since 100k + 11 ≡ 3 mod 4). However, squares of integers can only end in 0 or 1 modulo 4.",
    subjectTag: "Mathematics"
  }
];

export const RANDOM_QUESTS: RandomQuest[] = [
  {
    id: "quest-1",
    title: "The 20-20-20 Optic Reset",
    duration: "60 Seconds",
    category: "Physical Reset",
    prompt: "Look away from the monitor and fix your gaze on an object at least 20 feet (6 meters) away for 20 uninterrupted seconds, followed by 5 deep slow blinks.",
    tip: "Relaxes the ciliary eye muscles after intense reading of equations and small print."
  },
  {
    id: "quest-2",
    title: "Cold Water Hydro-Recharge",
    duration: "2 Minutes",
    category: "Physical Reset",
    prompt: "Step away to the sink, wash both hands with cold water, splash cold water across your closed eyelids twice, and drink a glass of fresh water.",
    tip: "Stimulates the mammalian dive reflex, dropping heart rate by 5-10% and improving alertness."
  },
  {
    id: "quest-3",
    title: "Postural Spine Decompression",
    duration: "90 Seconds",
    category: "Physical Reset",
    prompt: "Stand up tall, interlace your fingers above your head, reach for the ceiling on your tiptoes for 10 seconds, then roll your shoulders backward 8 times.",
    tip: "Counteracts hunching over notebooks and releases thoracic spine tension."
  },
  {
    id: "quest-4",
    title: "The Feynman Micro-Derivation",
    duration: "3 Minutes",
    category: "Mental Recalibration",
    prompt: "Pick the last challenging formula you studied today. Explain out loud in plain English (as if explaining to a 10-year-old) WHY it makes physical sense.",
    tip: "Exposes hidden memorization traps and converts passive familiarity into active recall."
  },
  {
    id: "quest-5",
    title: "Tactical Desk Sweep",
    duration: "2 Minutes",
    category: "Focus Micro-Habit",
    prompt: "Clear everything off your desk except one rough pad, one pen, and a water bottle. Put away stray pens, rough scrap sheets, and wrappers.",
    tip: "Visual clutter incurs constant subconscious micro-attentional penalties."
  },
  {
    id: "quest-6",
    title: "JEE Zen Breath Protocol",
    duration: "2 Minutes",
    category: "JEE Zen",
    prompt: "Close your eyes. Inhale for 4 seconds, hold for 4 seconds, exhale for 6 seconds. Repeat 6 complete cycles without moving a muscle.",
    tip: "Longer exhalations activate the parasympathetic vagal brake, neutralizing test anxiety."
  }
];
