# Affiliate CTA Contract

Review, Best, and Compare CTAs receive their destination only from a product's approved `affiliateUrl` or `merchantUrl`. Editorial `sourceUrls` are citations and are never a CTA input.

Every outbound affiliate CTA uses `rel="sponsored nofollow noopener"` and supplies page type, page slug, product slug, ASIN when known, CTA position, CTA label, and merchant context for analytics. A missing ASIN remains empty; it is never guessed.

The independence audit permits Amazon URLs in source citations, while rejecting hardcoded Amazon anchors, MerchantCTA props, and product merchant destinations.
