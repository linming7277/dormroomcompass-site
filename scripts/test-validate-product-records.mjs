import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validator = path.join(projectRoot, "scripts/validate-product-records.mjs");

function withFixture(mutate, verify) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "product-record-validator-"));
  try {
    fs.cpSync(path.join(projectRoot, "src/data/products"), path.join(root, "src/data/products"), { recursive: true });
    mutate(root);
    verify(spawnSync(process.execPath, [validator, "--root", root], { encoding: "utf8" }));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test("accepts the current site product records", () => {
  const result = spawnSync(process.execPath, [validator, "--root", projectRoot], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("rejects a product without an approved merchant destination", () => {
  withFixture(
    (root) => {
      const productDirectory = path.join(root, "src/data/products");
      const productFile = fs.readdirSync(productDirectory)
        .filter((name) => name.endsWith(".ts"))
        .sort()[0];
      assert.ok(productFile, "fixture must contain at least one product record");
      const file = path.join(productDirectory, productFile);
      fs.writeFileSync(
        file,
        fs.readFileSync(file, "utf8")
          .replace(/"affiliateUrl": "[^"]+"/, '"affiliateUrl": ""')
          .replace(/"merchantUrl": "[^"]+"/, '"merchantUrl": ""'),
      );
    },
    (result) => {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /approved merchant destination/);
    },
  );
});
