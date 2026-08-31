import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validator = path.join(projectRoot, "scripts/validate-review-content.mjs");

function firstReviewPath(root) {
  const reviewDir = path.join(root, "src/content/reviews");
  const filename = fs.readdirSync(reviewDir).find((file) => file.endsWith(".md"));
  if (!filename) throw new Error("fixture has no review markdown");
  return path.join(reviewDir, filename);
}

function updateFrontmatter(root, mutate) {
  const file = firstReviewPath(root);
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`no frontmatter in ${file}`);
  const data = JSON.parse(match[1]);
  mutate(data);
  fs.writeFileSync(file, text.replace(match[1], JSON.stringify(data, null, 2)));
}

function runValidator(root) {
  return spawnSync(process.execPath, [validator, "--root", root], {
    encoding: "utf8",
  });
}

function withFixture(mutate, verify) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "review-validator-"));
  try {
    fs.cpSync(path.join(projectRoot, "src"), path.join(root, "src"), { recursive: true });
    mutate(root);
    verify(runValidator(root));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test("accepts the current review collection", () => {
  const result = runValidator(projectRoot);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("rejects a review without sourceUrls", () => {
  withFixture(
    (root) => updateFrontmatter(root, (data) => delete data.sourceUrls),
    (result) => {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /sourceUrls/);
    },
  );
});

test("rejects a review whose productSlug is unknown", () => {
  withFixture(
    (root) => updateFrontmatter(root, (data) => { data.productSlug = "missing-product"; }),
    (result) => {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /productSlug/);
    },
  );
});

test("rejects a review whose guideSlug is unknown", () => {
  withFixture(
    (root) => updateFrontmatter(root, (data) => { data.guideSlug = "missing-guide"; }),
    (result) => {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /guideSlug/);
    },
  );
});
