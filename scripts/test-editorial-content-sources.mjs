import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("best and comparison routes use Markdown collections rather than TypeScript article bodies", () => {
  const routes = [read("src/pages/best/[slug].astro"), read("src/pages/compare/[slug].astro")].join("\n");
  assert.match(routes, /getCollection/);
  assert.match(routes, /getEntry/);
  assert.match(routes, /render\(/);
  assert.doesNotMatch(routes, /@\/data\/bestPicks/);
  assert.doesNotMatch(routes, /@\/data\/comparisons/);
});

test("editorial collections and validator require decision fields", () => {
  const config = read("src/content.config.ts");
  const validator = read("scripts/validate-editorial-content.mjs");
  assert.match(config, /bestPicks: defineCollection/);
  assert.match(config, /comparisons: defineCollection/);
  assert.match(config, /selectionCriteria/);
  assert.match(config, /decisionDimensions/);
  assert.match(validator, /single-brand selection must use contentMode brand-format-guide/);
  assert.match(validator, /comparison needs Choose A, Choose B, and neither paths/);
});
