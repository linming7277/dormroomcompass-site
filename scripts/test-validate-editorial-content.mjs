import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validator = path.join(projectRoot, "scripts/validate-editorial-content.mjs");

function withFixture(collection, mutate, verify) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "editorial-validator-"));
  try {
    fs.cpSync(path.join(projectRoot, "src"), path.join(root, "src"), { recursive: true });
    const collectionDirectory = path.join(root, "src/content", collection);
    const filename = fs.readdirSync(collectionDirectory)
      .filter((name) => name.endsWith(".md"))
      .sort()[0];
    assert.ok(filename, `${collection} fixture must contain at least one record`);
    const file = path.join(collectionDirectory, filename);
    const text = fs.readFileSync(file, "utf8");
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) throw new Error(`missing frontmatter: ${file}`);
    const data = JSON.parse(match[1]);
    mutate(data);
    fs.writeFileSync(file, text.replace(match[1], JSON.stringify(data, null, 2)));
    const result = spawnSync(process.execPath, [validator, "--root", root], { encoding: "utf8" });
    verify(result);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test("rejects a Best record without a bestFor value", () => {
  withFixture("best", (data) => { data.picks[0].bestFor = ""; }, (result) => {
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /bestFor/);
  });
});

test("rejects a Best record without a skipIf value", () => {
  withFixture("best", (data) => { data.picks[0].skipIf = ""; }, (result) => {
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /skipIf/);
  });
});

test("rejects a comparison without three decision dimensions", () => {
  withFixture("comparisons", (data) => { data.decisionDimensions = data.decisionDimensions.slice(0, 2); }, (result) => {
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /decision dimensions/);
  });
});
