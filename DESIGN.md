# Design System

## Direction

A compact product-research publication inspired by the information discipline of established comparison sites, while retaining an independent identity. Pages should resemble a carefully maintained field guide rather than a marketing landing page.

## Theme

- Light, high-contrast reading surface.
- Restrained palette: white and cool neutral surfaces, deep navy ink, cobalt primary action, evergreen evidence accent, amber caution.
- Color values are supplied through `theme.config.ts` and rendered as CSS custom properties so each generated site can establish its own identity.
- No gradients, glass effects, decorative shadows, oversized rounded sections, or repeated eyebrow labels.

## Typography

- Source Sans 3 Variable for UI and editorial copy.
- Strong hierarchy through weight and spacing, not negative letter spacing.
- Body text is 16-18px with comfortable line height; compact metadata remains at least 13px.
- Hero-scale type is reserved for the homepage lead and major review titles. Cards and sidebars use compact headings.

## Layout

- Maximum content width: 1600px, with responsive horizontal padding and constrained reading columns inside long-form pages.
- Global header: utility disclosure strip, brand row, compact primary navigation, category navigation.
- Homepage: lead story plus most-popular rail, trust statement, then repeated category bands.
- Category pages: title and context, featured guide, related subcategories, scan-friendly article list.
- Best pages: editorial header, quick picks, comparison table, detailed recommendation sections, methodology and related content.
- Review pages: decision summary, product media, optional verified scorecard, pros/cons, specifications, evidence notes, alternatives.
- Mobile layouts stack predictably; comparison tables scroll inside a stable container rather than expanding the viewport.

## Components

- `SiteHeader`: utility disclosure, brand identity, main navigation, category navigation.
- `SiteFooter`: category links, editorial/trust links, legal links, short disclosure.
- `FeatureStory`: image-led lead guide with short decision-oriented summary.
- `PopularList`: ranked editorial links without decorative cards.
- `CategoryBand`: category title, subcategory links, featured content cards.
- `ProductCard`: product image, award, evidence label, verdict, buyer fit, CTA.
- `QuickPicks`: stable summary of winners by use case.
- `ProductComparisonTable`: semantic, horizontally contained comparison table.
- `ScoreBreakdown`: optional verified editorial score and category dimensions.
- `EvidenceBadge` and `EvidenceNotes`: distinguish hands-on, merchant-verified, and source-checked claims.

## Interaction

- Links and buttons have visible hover and focus states.
- Navigation dropdowns use native `details` behavior where practical so keyboard and touch input work without client JavaScript.
- Motion is limited to short color and border transitions and respects reduced-motion preferences.

## Content Rules

- Product imagery must be owned, licensed, merchant-provided under allowed terms, or generated for non-deceptive illustration.
- A score, award, review schema, or “tested” label is rendered only when the record contains supporting evidence.
- Commercial links use `rel="sponsored nofollow"` and have a nearby disclosure.
- Dynamic prices, availability, discounts, and ratings are omitted unless the source and checked time support them.
