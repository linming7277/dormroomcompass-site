# Product Facts Contract

One product lives in `src/data/products/{slug}.ts`. `productName` and `name` retain the full verified identity. `displayTitle` is optional reader-facing copy for headings and cards; when absent, components fall back to the full identity.

Every publishable product record requires a deterministic slug, product identity, category, approved merchant or affiliate destination, image, source URLs, factual limits, and identifiers when known. Product schema always uses the full product identity, never `displayTitle`.

`validate-product-records.mjs` blocks a non-demo record without an approved merchant destination, product image, or required media-rights fields.
