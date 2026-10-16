import test from "node:test";
import assert from "node:assert";
import {
  COOKIE_DECLARATIONS,
  DEFAULT_CONSENT_PREFERENCES,
  CONSENT_COOKIE_NAME,
} from "../features/privacy/types/cookie-consent.types.js";

test("Cookie Consent Types & Declarations integrity", () => {
  assert.strictEqual(DEFAULT_CONSENT_PREFERENCES.essential, true);
  assert.strictEqual(DEFAULT_CONSENT_PREFERENCES.analytics, false); // Strict privacy default
  assert.ok(COOKIE_DECLARATIONS.length >= 4);

  const essential = COOKIE_DECLARATIONS.filter(c => c.category === "essential");
  assert.ok(essential.some(c => c.name.includes("auth-token")));
  assert.ok(essential.some(c => c.name === CONSENT_COOKIE_NAME));

  const analytics = COOKIE_DECLARATIONS.filter(c => c.category === "analytics");
  assert.ok(analytics.length > 0);
});
