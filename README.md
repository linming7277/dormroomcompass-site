# Affiliate Site Astro

Config-driven Astro template for focused affiliate product-research sites.

This template intentionally stays smaller than a SaaS boilerplate. It keeps static Astro pages, Tailwind styling, sitemap generation, trust pages, disclosure blocks, and a product-data model that can be generated from a product library.

## Design Goals

- Build affiliate sites from configuration, not scattered hard-coded pages.
- Keep trust/compliance pages crawlable and visible.
- Make affiliate disclosure and editorial methodology obvious.
- Support product reviews, category pages, best-of pages, comparison pages, brand pages, and buying guides.
- Avoid authentication, payments, admin panels, AI tools, and databases in the public site template.
- Use a compact category-first research architecture inspired by proven comparison publications without copying their brand, photography, proprietary scoring, or testing claims.
- Default to source-checked research. Render hands-on language, ratings, awards, and schema only when the evidence record supports them.

## Main Files

- `src/config/site.config.ts`: site identity, niche, audience, navigation.
- `src/config/affiliate.config.ts`: disclosure text, link attributes, merchant tracking policy.
- `src/config/monetization.config.ts`: affiliate-first monetization priority and ad fallback slots.
- `src/config/publishing.config.ts`: staging/production indexing gate and human-review policy.
- `src/config/theme.config.ts`: site-specific color identity rendered through CSS custom properties.
- `src/data/products.ts`: product records.
- `src/data/brands.ts`: brand records.
- `src/data/categories.ts`: category records.
- `src/data/comparisons.ts`: comparison page records.
- `src/data/contentPlan.ts`: buying-guide records.
- `src/data/pageMatrix.ts`: page-type matrix for category, review, comparison, brand, and guide generation.
- `PRODUCT.md`: strategic audience, purpose, trust posture, and anti-reference rules.
- `DESIGN.md`: visual, layout, responsive, and component rules.
- `src/pages/*`: generated public routes.
- `affiliate-site.schema.json`: contract shape for the bootstrap's single
  `affiliate-site.json` configuration source.
- `check.gates.json`: machine-readable evidence, compliance, content, media,
  link, legal, and build gates generated for each site.

## Routes

- `/`
- `/categories/`
- `/categories/[slug]/`
- `/best/`
- `/best/[slug]/`
- `/reviews/`
- `/reviews/[slug]/`
- `/compare/`
- `/compare/[slug]/`
- `/brands/`
- `/brands/[slug]/`
- `/guides/`
- `/guides/[slug]/`
- `/affiliate-disclosure/`
- `/editorial-policy/`
- `/review-methodology/`
- `/about/`
- `/contact/`
- `/privacy/`
- `/terms/`

## Affiliate Rules

- Merchant links are rendered with `rel="sponsored nofollow"` by default.
- Affiliate links are the only primary monetization. Adsterra or Monetag can be a disabled, secondary display experiment after production verification; AdSense is intentionally absent.
- Do not claim hands-on testing unless the `evidence.testedByUs` field is true and notes explain how.
- Every product needs source URLs, a checked date, image-rights treatment, and a factual-limits note. Dynamic claims stay out of copy and schema until verified.
- Do not use fake testimonials, fake revenue claims, or copied merchant screenshots.
- Keep About, Contact, Privacy, Terms, Affiliate Disclosure, Editorial Policy, and Review Methodology reachable from the footer.

## Research-Portal Structure

- The homepage leads with one configured product/category story, a ranked popular list, an evidence promise, and repeated category bands. It must never describe itself as a template.
- Category pages explain the buyer decision, surface the shortlist, provide an at-a-glance comparison, and link to distinct guides or comparisons.
- Best pages use quick picks, one stable comparison table, detailed recommendations, explicit skip conditions, and methodology notes.
- Review pages show a verdict, best-fit and avoid-when guidance, optional evidence-backed scores, pros/cons, specifications, source notes, and alternatives.
- `site.config.ts` controls primary navigation, category navigation, trust language, the homepage feature, and popular links. `theme.config.ts` controls the independent visual identity.
- Product `award`, `editorialScore`, and `scoreDimensions` fields are optional. Omit them when the source record cannot defend the label or value.

## SEO-Awesome Rules

- Start from first-party or owned data: product library fields, merchant availability, real price snapshots, GSC/GA4 feedback, and Keyword Planner/Suggest evidence.
- Keep `src/config/publishing.config.ts` in `staging` until product data, affiliate disclosure, analytics, legal pages, and sample pages are reviewed. Staging mode emits `noindex,nofollow` and blocks robots.
- Use `src/data/pageMatrix.ts` to decide which page types are justified. Do not create multiple pages for the same intent unless the product data and keyword evidence are different.
- Store keyword evidence on each category/product/comparison/guide via the `seo` object: primary keyword, secondary keywords, intent, KGR/monthly volume when available, competition note, trend state, and priority.
- Store post-launch feedback in the `feedback` object: GSC clicks/impressions/CTR/position and GA4 users. This is what should drive title fixes, content expansion, or new inner pages.
- Emit Product rating/review schema only when the record has real `reviewSummary` and the evidence supports it. The template intentionally does not invent aggregate ratings.
- Keep sample records in staging. The sample merchant URLs and product facts are illustrative only, not affiliate offers.
- A staging build deliberately emits no sitemap artifact. The sitemap plugin is
  enabled only after controlled production promotion.
- Prefer affiliate CTAs first. Use display ads only as fallback or secondary monetization when the page has enough content and user value.

## Quick Start

```bash
npm install
npm run check
npm run build
npm run audit:template
```

For a new site, replace the sample data in `src/config` and `src/data`, then build.

Before production launch:

1. Replace `https://example.com` in `src/config/site.config.ts`.
2. Replace placeholder product images with owned, licensed, merchant-provided, or generated assets that are appropriate for the niche.
3. Configure `categoryNavSlugs`, `home.featuredCategorySlug`, `home.featuredProductSlug`, and `home.popularLinks` with routes that actually exist.
4. Configure an independent palette in `src/config/theme.config.ts`; do not copy a competitor's exact brand system.
5. Add real affiliate IDs and verify every outbound merchant URL.
6. Dry-run the controlled promotion after every contract gate passes:

   ```bash
   python3 /Users/dmb/Desktop/web/hermes-website-automation/scripts/game-site-bootstrap-kit/promote_affiliate_site.py \
     . --contract affiliate-site.json --dry-run
   ```

7. Run the same command without `--dry-run`. Do not edit `indexingMode`
   manually. The promotion command backs up the publishing config and contract,
   runs the build checks, verifies production robots/meta/sitemap output, and
   restores staging automatically if any check fails.
# Affiliate Site Astro V2

See [`contracts/`](./contracts/) for the site-config, product-facts, editorial, merchant-dynamic-data, media-rights, and affiliate-CTA boundaries.
