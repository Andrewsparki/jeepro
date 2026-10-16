import test from "node:test";
import assert from "node:assert";
import { getPhysicsChapterDataset, getDatasetFormulas } from "../features/study/services/physics-knowledge.service.js";

const CHAPTER_SLUGS = [
  "physics-measurement",
  "kinematics",
  "laws-of-motion",
  "work-energy-power",
  "rotational-motion",
  "gravitation"
];

test("Physics Knowledge Service: Load and verify all 6 chapters", () => {
  CHAPTER_SLUGS.forEach(slug => {
    const ds = getPhysicsChapterDataset(slug);
    assert.ok(ds, `Dataset should exist for slug: ${slug}`);
    assert.ok(ds.id, `Dataset should have an id: ${slug}`);
    assert.ok(ds.title, `Dataset should have a title: ${slug}`);
    assert.ok(typeof ds.notes === "string" && ds.notes.length > 500, `Dataset notes should be comprehensive markdown for ${slug}`);
    assert.ok(Array.isArray(ds.formulas) && ds.formulas.length > 0, `Dataset formulas should be non-empty for ${slug}`);
    assert.ok(Array.isArray(ds.derivations) && ds.derivations.length > 0, `Dataset derivations should be non-empty for ${slug}`);
    assert.ok(Array.isArray(ds.graphs) && ds.graphs.length > 0, `Dataset graphs should be non-empty for ${slug}`);
    assert.ok(Array.isArray(ds.commonMistakes) && ds.commonMistakes.length > 0, `Dataset common mistakes should be non-empty for ${slug}`);
    assert.ok(Array.isArray(ds.quickRevision) && ds.quickRevision.length > 0, `Dataset quick revision should be non-empty for ${slug}`);

    // Verify formulas translation
    const formulas = getDatasetFormulas(ds, slug);
    assert.strictEqual(formulas.length, ds.formulas.length);
    assert.ok(formulas[0].formula, `Formula card should have LaTeX math string`);
    assert.ok(formulas[0].variables.length > 0, `Formula card should have variable mappings`);
  });
});
