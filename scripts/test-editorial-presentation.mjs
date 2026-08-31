import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(siteRoot, relativePath), "utf8");

test("review presentation uses V2 decision modules before its merchant CTA", () => {
  const route = read("src/pages/reviews/[slug].astro");
  const decision = read("src/components/ReviewDecisionSummary.astro");
  assert.match(route, /ReviewDecisionSummary/);
  assert.match(route, /ProductDecisionCard/);
  assert.ok(route.indexOf("ReviewDecisionSummary") < route.lastIndexOf("MerchantCTA"));
  assert.doesNotMatch(route, /Source-checked merchant record/);
  assert.match(route, /decision=\{review\.data\.decision\}/);
  assert.match(decision, /decision\.headline/);
  assert.doesNotMatch(decision, /product\.bestFor|product\.skipIf/);
});

test("public components do not render internal evidence labels or a default shortlist label", () => {
  const source = [
    read("src/components/EvidenceNotes.astro"),
    read("src/components/ProductComparisonTable.astro"),
    read("src/components/ProductCard.astro"),
  ].join("\n");
  assert.doesNotMatch(source, /evidence\.sourceNotes/);
  assert.doesNotMatch(source, /Shortlisted/);
  assert.doesNotMatch(source, /product\.verdict/);
  assert.doesNotMatch(read("src/components/EvidenceBadge.astro"), /Source checked/);
});

test("best pages render a sourced decision card with a commercial CTA per pick", () => {
  const source = read("src/pages/best/[slug].astro");
  assert.match(source, /ProductDecisionCard/);
  assert.match(source, /Comparison first/);
  assert.match(source, /How we picked/);
  assert.doesNotMatch(source, /shortlisted/i);
  assert.doesNotMatch(source, /ScoreBreakdown/);
  assert.doesNotMatch(source, /ProsCons/);
  assert.match(source, /getProductReadingPath/);
});

test("homepage promotes editorial paths rather than an unsupported popular list or merchant CTA", () => {
  const source = read("src/pages/index.astro");
  assert.doesNotMatch(source, />Most popular</);
  assert.doesNotMatch(source, /MerchantCTA/);
  assert.match(source, /Start with the buyer task/);
  assert.match(source, /Choose your path/);
  assert.match(source, /Featured buying guides/);
  assert.match(source, /Featured reviews/);
});
