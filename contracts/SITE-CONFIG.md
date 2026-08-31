# Site Config Contract

`src/config/site.config.ts` is the sole owner of site identity and publication-level copy.

Required runtime fields are site name, domain, positioning, author, contact email, primary navigation, primary category, affiliate disclosure, AI transparency, and robots/indexing mode. Theme tokens, analytics enablement, social links, and footer copy are configuration inputs, never page-type conditionals.

No component, layout, page route, or fixture may name a real deployed site. Example data is permitted only when clearly non-production.

## Category-site identity boundary

For a category site, `name`, `domain`, `positioning`, `niche`, homepage paths, and navigation describe the shopper niche or category. They must be supplied by runtime settings; they must never be inferred from `Product.brand`, a merchant, an affiliate platform, or a selected brand.

`Product.brand` owns product identity only. Brand hubs are generated at `/brands/[slug]/`; category hubs are generated at `/categories/[slug]/`. A category site's intake uses `site_strategy: "vertical_multi_brand"`; its Best page must bind at least three products from at least two brands, and its default comparison must bind products from at least two brands. A single-brand site is valid only when the human-confirmed intake explicitly declares `site_strategy: "brand_focused"`.
