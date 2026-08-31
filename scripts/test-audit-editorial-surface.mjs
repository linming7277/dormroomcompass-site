import assert from "node:assert/strict";
import test from "node:test";

import { auditHtmlPages } from "./audit-editorial-surface.mjs";

test("editorial surface audit accepts an editorial hub without merchant CTA and a review within the V2 CTA range", () => {
  const result = auditHtmlPages([
    { route: "/", html: "<main>Editorial choices</main>" },
    {
      route: "/reviews/example/",
      html: '<a rel="sponsored nofollow noopener">Check listing</a><a rel="sponsored nofollow noopener">Check listing</a>',
    },
  ]);
  assert.deepEqual(result.failures, []);
});

test("editorial surface audit rejects internal terminology and out-of-policy V2 CTA counts", () => {
  const result = auditHtmlPages([
    {
      route: "/best/example/",
      html: '<p>Approved fact</p>',
    },
    {
      route: "/reviews/example/",
      html: '<a rel="sponsored nofollow noopener"></a><a rel="sponsored nofollow noopener"></a><a rel="sponsored nofollow noopener"></a><a rel="sponsored nofollow noopener"></a>',
    },
  ]);
  assert.equal(result.failures.length, 2);
});
