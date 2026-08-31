# Affiliate Site Template V2 Content Contract

This contract separates reusable page presentation from site configuration, product records, and editorial Markdown. Demo records are noindex-only and must never be promoted into a production sitemap.

## Ownership boundaries

| Layer | Location | Responsibility |
| --- | --- | --- |
| Template | `src/pages`, `src/components`, `src/layouts`, `src/styles` | Routes, responsive presentation, schema, CTA placement |
| Site config | `src/config/site.config.ts` | Identity, navigation, taxonomy entry points, trust copy, homepage paths |
| Product data | `src/data/products/{slug}.ts` | Product identity, identifiers, images, source URLs, key facts, merchant dynamic data |
| Editorial content | `src/content/{reviews,guides,best,comparisons}` | Buyer questions, conditions, tradeoffs, source-backed Markdown |

AI may generate or revise approved Markdown only. It must not modify Astro templates, product data, URL rules, canonical URLs, robots, or sitemap behavior.

## Shared rules

- Frontmatter is JSON and `sourceUrls` has at least one valid URL.
- Body headings use `##` and `###`; do not use H1 in Markdown.
- Do not invent prices, discounts, availability, ratings, sales, testing, personal experience, product efficacy, medical advice, or dynamic merchant facts.
- A commercial decision must name a condition and a no-buy path.
- Product filename and `productSlug` are identical; the product must exist. A Review `guideSlug` must resolve to an existing Guide.

## Review

`reviews/{productSlug}.md` requires `productSlug`, `title`, `description`, `guideSlug`, `decision.headline`, `decision.bestFit`, `decision.skipIf`, dates, and `sourceUrls`. It answers what the product role is, who may consider it, who should skip it, what to verify, and how the current listing is used at the final step.

## Guide

`guides/{slug}.md` is independent buyer education. It requires a real buyer question, category, linked products where relevant, sources, a decision sequence, and at least one boundary where another route is better.

## Best

`best/{slug}.md` requires at least three picks. Every pick has `selectionReason`, `bestFor`, `tradeoff`, and `skipIf`. Use `multi-brand-best` only when evidence supports a cross-brand shortlist; otherwise use `brand-format-guide` and state the narrower scope.

## Compare

`comparisons/{slug}.md` requires three or more decision dimensions, a visible no-buy path, and source-backed buyer conditions. Three-product comparisons render equal A/B/C decision cards; do not collapse them to an A/B UI.

## Validation

`npm run check` and `npm run build` run Review and editorial validation before Astro. `audit:template`, `audit:content`, `audit:editorial`, `audit:similarity`, and route/inventory audits are required before a production release.
