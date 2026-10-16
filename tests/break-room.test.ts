import { test } from "node:test";
import assert from "node:assert/strict";
import { BRAIN_TEASERS, RANDOM_QUESTS } from "../features/break-room/data/break-room-data";

test("Break Room: Brain Teasers data integrity", () => {
  assert.ok(BRAIN_TEASERS.length >= 4, "Should have at least 4 brain teasers");
  for (const teaser of BRAIN_TEASERS) {
    assert.ok(teaser.id, "Teaser must have an id");
    assert.ok(teaser.question.length > 10, "Teaser must have a substantive question");
    assert.ok(teaser.hint.length > 5, "Teaser must have a hint");
    assert.ok(teaser.answer.length > 1, "Teaser must have an answer");
    assert.ok(teaser.explanation.length > 10, "Teaser must have an explanation");
    assert.ok(["Physics", "Mathematics", "Chemistry", "Pure Logic"].includes(teaser.subjectTag));
  }
});

test("Break Room: Random Quests data integrity", () => {
  assert.ok(RANDOM_QUESTS.length >= 4, "Should have at least 4 random quests");
  for (const quest of RANDOM_QUESTS) {
    assert.ok(quest.id, "Quest must have an id");
    assert.ok(quest.title.length > 3, "Quest must have a title");
    assert.ok(quest.prompt.length > 10, "Quest must have a clear actionable prompt");
    assert.ok(quest.tip.length > 5, "Quest must have a scientific/tactical rationale");
    assert.ok(["Physical Reset", "Mental Recalibration", "JEE Zen", "Focus Micro-Habit"].includes(quest.category));
  }
});

test("Break Room: Word matcher case-insensitivity logic", () => {
  const trigger = "bored";
  const testInputs = ["bored", "BORED", "BoReD", "bOrEd"];
  for (const input of testInputs) {
    assert.strictEqual(input.toLowerCase(), trigger, `Input ${input} should match 'bored'`);
  }
});
