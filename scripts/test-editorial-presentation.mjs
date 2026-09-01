import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(siteRoot, relativePath), "utf8");

test("review presentation uses one above-the-fold decision module without repeating it below the disclosure", () => {
  const route = read("src/pages/reviews/[slug].astro");
  assert.match(route, /review-hero-decision/);
  assert.match(route, /review\.data\.decision\.headline/);
  assert.match(route, /review\.data\.decision\.bestFit/);
  assert.match(route, /review\.data\.decision\.skipIf/);
  assert.ok(route.indexOf("review-hero-decision") < route.indexOf("<Content \/>"));
  assert.doesNotMatch(route, /ReviewDecisionSummary/);
  assert.doesNotMatch(route, /ProductDecisionCard/);
  assert.doesNotMatch(route, /Source-checked merchant record/);
});

test("catalog product media preserves the complete image instead of cropping it", () => {
  const sources = [
    read("src/components/CategoryBand.astro"),
    read("src/components/FeatureStory.astro"),
    read("src/components/ResponsiveImage.astro"),
    read("src/pages/guides/[slug].astro"),
    read("src/pages/reviews/[slug].astro"),
  ];
  for (const source of sources) {
    assert.doesNotMatch(source, /object-cover/);
    assert.match(source, /object-contain/);
  }
  const homepage = read("src/pages/index.astro");
  const productImages = homepage.match(/<img[^>]+src=\{[^}]+\.image\}[^>]+>/g) ?? [];
  assert.ok(productImages.length > 0);
  for (const image of productImages) assert.match(image, /object-contain/);
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
