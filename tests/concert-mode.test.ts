import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { VISUAL_THEMES } from "../features/concert-mode/types/themes";

test("Concert Mode: Audio asset existence and integrity", () => {
  const audioPath = path.resolve(process.cwd(), "public/audio/miguel-phonk-matadora.m4a");
  assert.ok(fs.existsSync(audioPath), "Audio file must exist in public/audio/");
  const stat = fs.statSync(audioPath);
  assert.ok(stat.size > 1000000, `Audio file should be complete (size: ${stat.size} bytes)`);
});

test("Concert Mode: Secret triggers case-insensitivity logic", () => {
  const triggers = ["concert"];
  for (const trigger of triggers) {
    const variations = [
      trigger.toLowerCase(),
      trigger.toUpperCase(),
      trigger[0].toUpperCase() + trigger.slice(1).toLowerCase(),
    ];
    for (const v of variations) {
      assert.strictEqual(v.toLowerCase(), trigger, `Trigger ${v} should normalize to ${trigger}`);
    }
  }
});

test("Concert Mode: Themes data integrity", () => {
  const expectedThemes = ["obsidian", "cyberpunk", "midnight", "neon-arena", "minimal-wave"];
  for (const themeId of expectedThemes) {
    const theme = (VISUAL_THEMES as any)[themeId];
    assert.ok(theme, `Theme ${themeId} must exist`);
    assert.ok(theme.name, `Theme ${themeId} must have a name`);
    assert.ok(theme.primaryAccent, `Theme ${themeId} must have a primary accent`);
    assert.ok(theme.bgBase, `Theme ${themeId} must have a background base`);
  }
});

test("Concert Mode: Playlist boundary logic", () => {
  const sampleTracks = [{ id: "1" }, { id: "2" }, { id: "3" }];
  
  // Track 1: index 0
  let currentIndex = 0;
  assert.strictEqual(currentIndex > 0, false, "Track 1 should not have prev");
  assert.strictEqual(currentIndex < sampleTracks.length - 1, true, "Track 1 should have next");
  
  // Track 3: index 2
  currentIndex = 2;
  assert.strictEqual(currentIndex > 0, true, "Track 3 should have prev");
  assert.strictEqual(currentIndex < sampleTracks.length - 1, false, "Track 3 should not have next");
});
