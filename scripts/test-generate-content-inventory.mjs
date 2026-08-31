import assert from "node:assert/strict";
import test from "node:test";

import { collectContentInventory } from "./generate-content-inventory.mjs";

const siteRoot = new URL("..", import.meta.url).pathname;

test("inventory gives every commercial source or manifest route an explicit version and action", () => {
  const inventory = collectContentInventory(siteRoot);

  assert.ok(inventory.records.length > 0);
  assert.ok(inventory.records.every((record) => record.contentVersion));
  assert.ok(inventory.records.every((record) => record.action));
  assert.ok(inventory.records.some((record) => record.url === "/reviews/example-product-a/"));
  assert.equal(
    inventory.records.find((record) => record.url === "/reviews/example-product-a/")?.publicationState,
    "manifested",
  );
  assert.deepEqual(inventory.summary.manifestMissingSourceRoutes, []);
  assert.equal(
    inventory.records.find((record) => record.url === "/best/example-desk-setup-tools/")?.contentSource,
    "best_markdown",
  );
  assert.equal(
    inventory.records.find((record) => record.url === "/compare/example-workspace-tools/")?.contentSource,
    "comparison_markdown",
  );
  assert.equal(
    inventory.records.find((record) => record.url === "/best/example-desk-setup-tools/")?.contentVersion,
    "latest",
  );
  assert.equal(
    inventory.records.find((record) => record.url === "/reviews/example-product-a/")?.contentVersion,
    "latest",
  );
  assert.equal(inventory.schemaVersion, "affiliate-site-content-inventory-v2");
  assert.ok(
    inventory.records
      .filter((record) => record.pageType !== "trust")
      .every((record) => record.primaryIntent !== "not_recorded"),
  );
});
