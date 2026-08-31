import assert from "node:assert/strict";
import test from "node:test";

import { getMerchantRatingDisplay } from "../src/utils/merchantData.mjs";

const now = new Date("2026-08-29T00:00:00Z");
const base = {
  merchant: "Amazon",
  market: "US",
  rating: 4.5,
  ratingScale: 5,
  ratingCount: 100,
  checkedAt: "2026-08-25T00:00:00Z",
  sourceUrl: "https://www.amazon.com/dp/B012345678",
  status: "fresh",
};

test("fresh Amazon rating is displayable with an explicit label", () => {
  const result = getMerchantRatingDisplay(base, now);
  assert.equal(result.display, true);
  assert.equal(result.label, "Amazon rating");
  assert.equal(result.freshness, "fresh");
});

test("8 to 30 day merchant data is stale but displayable", () => {
  const result = getMerchantRatingDisplay({ ...base, checkedAt: "2026-08-10T00:00:00Z" }, now);
  assert.equal(result.display, true);
  assert.equal(result.freshness, "stale");
});

test("merchant data older than 30 days is hidden", () => {
  const result = getMerchantRatingDisplay({ ...base, checkedAt: "2026-07-20T00:00:00Z" }, now);
  assert.equal(result.display, false);
  assert.equal(result.freshness, "expired");
});

test("missing rating never renders as zero", () => {
  const result = getMerchantRatingDisplay({ ...base, rating: null, ratingCount: null }, now);
  assert.equal(result.display, false);
});
