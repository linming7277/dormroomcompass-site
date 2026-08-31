import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const audit = path.join(projectRoot, "scripts/audit-template-independence.mjs");

function withFixture(write, verify) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "template-independence-"));
  try {
    fs.cpSync(path.join(projectRoot, "src"), path.join(root, "src"), { recursive: true });
    fs.copyFileSync(path.join(projectRoot, "affiliate-site.json"), path.join(root, "affiliate-site.json"));
    for (const file of ["CONTENT-CONTRACT.md", "PRODUCT.md", "DESIGN.md"]) {
      fs.copyFileSync(path.join(projectRoot, file), path.join(root, file));
    }
    write(root);
    verify(spawnSync(process.execPath, [audit], { cwd: root, encoding: "utf8" }));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test("allows Amazon editorial source URLs in product evidence", () => {
  withFixture(
    (root) => fs.writeFileSync(
      path.join(root, "src/data/products/citation-source.ts"),
      'export const sourceUrls = ["https://www.amazon.com/dp/B0EXAMPLE"];\n',
    ),
    (result) => assert.equal(result.status, 0, result.stderr || result.stdout),
  );
});

test("rejects a hardcoded Amazon merchant anchor", () => {
  withFixture(
    (root) => fs.writeFileSync(
      path.join(root, "src/pages/unsafe-link.astro"),
      '<a href="https://www.amazon.com/dp/B0EXAMPLE">Buy now</a>\n',
    ),
    (result) => {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /commercial merchant anchor/);
    },
  );
});

test("rejects a hardcoded Amazon MerchantCTA", () => {
  withFixture(
    (root) => fs.writeFileSync(
      path.join(root, "src/pages/unsafe-cta.astro"),
      '<MerchantCTA href="https://www.amazon.com/dp/B0EXAMPLE" />\n',
    ),
    (result) => {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /commercial MerchantCTA/);
    },
  );
});

test("rejects a raw Amazon product merchant destination while allowing sourceUrls", () => {
  withFixture(
    (root) => fs.writeFileSync(
      path.join(root, "src/data/products/unsafe-destination.ts"),
      'export const product = { sourceUrls: ["https://www.amazon.com/dp/B0SOURCE"], merchantUrl: "https://www.amazon.com/dp/B0CTA" };\n',
    ),
    (result) => {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /product merchant destination/);
    },
  );
});
