import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function add(status, label, detail) {
  checks.push({ status, label, detail });
}

function pass(label, detail = "") {
  add("pass", label, detail);
}

function warn(label, detail = "") {
  add("warn", label, detail);
}

function fail(label, detail = "") {
  add("fail", label, detail);
}

const requiredFiles = [
  "src/config/site.config.ts",
  "src/config/affiliate.config.ts",
  "src/config/monetization.config.ts",
  "src/config/publishing.config.ts",
  "src/config/theme.config.ts",
  "src/content.config.ts",
  "src/content/reviews",
  "src/content/best",
  "src/content/comparisons",
  "src/data/products.ts",
  "src/data/products",
  "src/data/categories.ts",
  "src/data/pageMatrix.ts",
  "src/pages/affiliate-disclosure.astro",
  "src/pages/editorial-policy.astro",
  "src/pages/review-methodology.astro",
  "src/pages/ai-transparency.astro",
  "src/pages/privacy.astro",
  "src/pages/terms.astro",
  "src/pages/contact.astro",
  "src/components/SiteHeader.astro",
  "src/components/SiteFooter.astro",
  "src/components/EditorialByline.astro",
  "src/components/ProductDecisionCard.astro",
  "src/components/MerchantRating.astro",
  "PRODUCT.md",
  "DESIGN.md",
  "contracts/SITE-CONFIG.md",
  "contracts/PRODUCT-FACTS.md",
  "contracts/EDITORIAL-CONTENT.md",
  "contracts/MERCHANT-DYNAMIC-DATA.md",
  "contracts/MEDIA-RIGHTS.md",
  "contracts/AFFILIATE-CTA.md",
  "scripts/validate-product-records.mjs",
];

const generatedAffiliateSite = exists("affiliate-site.json");
const templateCommercialRoutes = [
  "src/pages/categories/[slug].astro",
  "src/pages/best/[slug].astro",
  "src/pages/reviews/[slug].astro",
  "src/pages/compare/[slug].astro",
  "src/pages/brands/[slug].astro",
  "src/pages/guides/[slug].astro",
];

if (generatedAffiliateSite) {
  pass(
    "Generated site has authoritative route data",
    "Commercial routes are source-bound files derived from affiliate-site.json.",
  );
}
requiredFiles.push(...templateCommercialRoutes);

for (const file of requiredFiles) {
  exists(file)
    ? pass(`Required file exists: ${file}`)
    : fail(`Missing required file: ${file}`);
}

if (exists("src/config/publishing.config.ts")) {
  const publishingConfig = read("src/config/publishing.config.ts");
  /indexingMode:\s*["'](?:staging|production)["']/.test(publishingConfig)
    ? pass("Publishing config declares an explicit indexing mode")
    : fail("Publishing config must declare staging or production indexing");
}

if (exists("src/config/site.config.ts")) {
  const siteConfig = read("src/config/site.config.ts");
  siteConfig.includes("https://example.com")
    ? warn(
        "Sample site URL still points to example.com",
        "Replace it before production launch.",
      )
    : pass("Site URL is no longer the sample domain");
  ["categoryNavSlugs", "trust", "home"].every((field) =>
    siteConfig.includes(field),
  )
    ? pass(
        "Site config drives category navigation, trust copy, and homepage selections",
      )
    : fail(
        "Site config must drive category navigation, trust copy, and homepage selections",
      );
}

if (exists("contracts/SITE-CONFIG.md")) {
  const siteContract = read("contracts/SITE-CONFIG.md");
  ["Product.brand", "vertical_multi_brand", "/brands/[slug]/", "/categories/[slug]/"].every((term) =>
    siteContract.includes(term),
  )
    ? pass("Site identity contract separates niche identity from product brands")
    : fail("Site identity contract must keep site identity separate from Product.brand");
}

if (
  exists("src/config/theme.config.ts") &&
  exists("src/layouts/BaseLayout.astro")
) {
  const theme = read("src/config/theme.config.ts");
  const layout = read("src/layouts/BaseLayout.astro");
  theme.includes("brandStrong") && layout.includes("themeConfig.colors")
    ? pass("Theme colors are configuration-driven CSS custom properties")
    : fail("Theme config must drive the rendered CSS custom properties");
}

if (exists("src/config/monetization.config.ts") && exists("src/types.ts")) {
  const monetization = read("src/config/monetization.config.ts");
  const types = read("src/types.ts");
  !monetization.toLowerCase().includes("adsense") &&
  !types.toLowerCase().includes("adsense")
    ? pass("Template does not include AdSense monetization")
    : fail("Template must not apply for or integrate AdSense");
  /priority:\s*\[\s*["']affiliate["']\s*,\s*["']ads["']\s*\]/.test(monetization)
    ? pass("Affiliate links are configured as the first monetization priority")
    : fail("Affiliate links must be the first monetization priority");
}

if (exists("src/utils/schema.ts")) {
  const schema = read("src/utils/schema.ts");
  schema.includes("product.reviewSummary?.ratingValue")
    ? pass("Product schema gates rating markup behind real reviewSummary data")
    : fail("Product schema should not emit rating markup unconditionally");
  schema.includes("product.evidence.testedByUs")
    ? pass("Review schema gates review markup behind testedByUs evidence")
    : fail(
        "Review schema should only emit hands-on review markup when evidence supports it",
      );
}

if (exists("src/components/MerchantCTA.astro")) {
  const cta = read("src/components/MerchantCTA.astro");
  cta.includes("affiliateConfig.defaultRel")
    ? pass("Merchant CTA uses configured sponsored/nofollow rel policy")
    : fail("Merchant CTA should use affiliateConfig.defaultRel");
}

if (exists("src/components/ProductCard.astro")) {
  const card = read("src/components/ProductCard.astro");
  card.includes("AffiliateDisclosure")
    ? pass("Commercial product cards render a nearby affiliate disclosure")
    : fail("Commercial product cards need a nearby affiliate disclosure");
}

if (
  exists("src/pages/reviews/[slug].astro") &&
  exists("src/pages/guides/[slug].astro") &&
  exists("src/pages/best/[slug].astro") &&
  exists("src/pages/compare/[slug].astro")
) {
  const editorialRoutes = [
    read("src/pages/reviews/[slug].astro"),
    read("src/pages/guides/[slug].astro"),
    read("src/pages/best/[slug].astro"),
    read("src/pages/compare/[slug].astro"),
  ].join("\n");
  editorialRoutes.includes("EditorialByline")
    ? pass("Editorial content types expose author, policy, and methodology context")
    : fail("Editorial content types must render EditorialByline");
}

if (exists("src/types.ts")) {
  const types = read("src/types.ts");
  ["sourceUrls", "imageRights", "factualLimits"].every((field) =>
    types.includes(field),
  )
    ? pass("Product evidence tracks sources, image rights, and factual limits")
    : fail(
        "Product evidence must track sources, image rights, and factual limits",
      );
  ["bestFor", "skipIf", "factualLimits"].every((field) =>
    types.includes(field),
  )
    ? pass(
        "Product model supports buyer fit, skip conditions, and evidence limits",
      )
    : fail("Product model must support buyer fit, skip conditions, and evidence limits");
}

if (exists("src/pages/index.astro")) {
  const homepage = read("src/pages/index.astro");
  const isResearchPortal =
    !homepage.includes("Buyer-first template") &&
    !homepage.includes("Most popular") &&
    !homepage.includes("MerchantCTA") &&
    homepage.includes("Start with the buyer task") &&
    homepage.includes("Choose your path") &&
    homepage.includes("Featured buying guides") &&
    homepage.includes("Featured reviews");
  isResearchPortal
    ? pass(
        "Homepage is a buyer-task publication rather than a template demo",
      )
    : fail("Homepage must render the V2 buyer-task publication structure");
}

if (exists("src/pages/robots.txt.ts")) {
  const robots = read("src/pages/robots.txt.ts");
  robots.includes("Disallow: /") && robots.includes("isProductionIndexing")
    ? pass("Robots route separates staging from production indexing")
    : fail("Robots route should block staging and allow production explicitly");
}

const distPath = path.join(root, "dist");
if (fs.existsSync(distPath)) {
  const htmlFiles = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".html")) {
        htmlFiles.push(fullPath);
      }
    }
  };
  walk(distPath);

  const html = htmlFiles
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  html.includes('rel="sponsored nofollow noopener"')
    ? pass("Built HTML contains sponsored nofollow noopener affiliate links")
    : html.includes("Merchant link pending verification")
      ? pass(
          "Built staging HTML suppresses commercial links until merchant verification",
        )
      : fail(
          "Built HTML must contain sponsored nofollow links or explicit pending-link controls",
        );
  html.includes("application/ld+json")
    ? pass("Built HTML contains JSON-LD")
    : fail("Built HTML did not include JSON-LD");
  (html.includes("Start with the buyer task") && html.includes("Our editorial approach") && !html.includes("Most popular"))
    ? pass("Built HTML exposes the V2 value proposition and editorial discovery paths")
    : fail("Built HTML must expose the V2 value proposition and editorial discovery paths");

  const robotsText = exists("dist/robots.txt") ? read("dist/robots.txt") : "";
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  const hasStagingRobotsMeta = metaTags.some(
    (tag) =>
      /\bname=(?:"robots"|'robots'|robots)(?:\s|>|\/)/i.test(tag) &&
      /\bcontent=(?:"noindex,nofollow"|'noindex,nofollow'|noindex,nofollow)(?:\s|>|\/)/i.test(
        tag,
      ),
  );
  const productionIndexing = /indexingMode:\s*["']production["']/.test(
    read("src/config/publishing.config.ts"),
  );
  if (productionIndexing) {
    !hasStagingRobotsMeta && html.includes('content="index,follow"')
      ? pass("Built HTML emits index,follow robots meta in production")
      : fail("Production HTML must emit index,follow robots meta");
    robotsText.includes("Allow: /") && !robotsText.includes("Disallow: /\n")
      ? pass("Built robots.txt permits production crawling")
      : fail("Production robots.txt must permit crawling");
    exists("dist/sitemap-index.xml")
      ? pass("Production build generates a sitemap index")
      : fail("Production build must generate a sitemap index");
  } else {
    hasStagingRobotsMeta
      ? pass("Built HTML emits noindex,nofollow robots meta in staging")
      : fail("Built HTML must emit noindex,nofollow robots meta in staging");
    robotsText.includes("Disallow: /")
      ? pass("Built robots.txt blocks crawling in staging mode")
      : fail("Staging robots.txt must block crawling");
    !exists("dist/sitemap-index.xml") && !exists("dist/sitemap-0.xml")
      ? pass("Staging build does not generate sitemap artifacts")
      : fail("Staging build must not generate or expose sitemap artifacts");
  }
} else {
  warn(
    "dist directory not found",
    "Run npm run build before audit:template for production artifact checks.",
  );
}

const failures = checks.filter((check) => check.status === "fail");
const warnings = checks.filter((check) => check.status === "warn");

for (const check of checks) {
  const prefix =
    check.status === "pass"
      ? "PASS"
      : check.status === "warn"
        ? "WARN"
        : "FAIL";
  console.log(
    `${prefix} ${check.label}${check.detail ? ` - ${check.detail}` : ""}`,
  );
}

console.log(
  `\nTemplate audit: ${checks.length - failures.length - warnings.length} passed, ${warnings.length} warnings, ${failures.length} failures.`,
);

if (failures.length > 0) {
  process.exit(1);
}
