# Editorial Content Contracts

Editorial Markdown owns reader-facing Review, Best, Compare, and Guide bodies. Components own presentation only.

- Review: `productSlug`, `guideSlug`, `sourceUrls`, decision headline, best fit, and skip condition.
- Best: product list, ranked picks, each pick's best-for, tradeoff, skip-if, and selection criteria.
- Compare: at least two product slugs, decision dimensions, and choose-A, choose-B, and no-buy paths.
- Guide: slug, category, source URLs, and valid product references when present.

Every Markdown filename equals its own slug or product slug as appropriate. Validators reject unknown product or guide references, empty source URLs, missing decision fields, and Markdown H1s.
