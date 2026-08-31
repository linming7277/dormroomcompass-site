import assert from "node:assert/strict";
import test from "node:test";

import { deriveRouteManifest } from "./sync-route-manifest.mjs";

test("route manifest derives commercial routes from the authoritative page plan", () => {
  const manifest = deriveRouteManifest(
    {
      page_plan: {
        pages: [
          { route: "/" },
          { route: "/reviews/example/" },
          { route: "/guides/example/" },
        ],
      },
    },
    { fixed_routes: ["/", "/reviews/"] },
  );
  assert.deepEqual(manifest.commercial_routes, [
    "/guides/example/",
    "/reviews/example/",
  ]);
  assert.deepEqual(manifest.all_routes, [
    "/",
    "/guides/example/",
    "/reviews/",
    "/reviews/example/",
  ]);
});
