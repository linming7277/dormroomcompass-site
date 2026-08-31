import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_SITE_ROOT = path.resolve(SCRIPT_DIR, "..");
const TRUST_ROUTES = new Set([
  "/about/",
  "/affiliate-disclosure/",
  "/contact/",
  "/editorial-policy/",
  "/privacy/",
  "/review-methodology/",
  "/terms/",
]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function parseFrontmatter(file) {
  const raw = fs.readFileSync(file, "utf8");
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) throw new Error(`Missing JSON frontmatter: ${file}`);
  return JSON.parse(match[1]);
}

function markdownFiles(directory) {
  return fs.readdirSync(directory)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => path.join(directory, name));
}

function routePageType(url) {
  if (url === "/") return "home";
  if (url.startsWith("/reviews/")) return "review";
  if (url.startsWith("/guides/")) return "guide";
  if (url.startsWith("/best/")) return "best";
  if (url.startsWith("/compare/")) return "comparison";
  if (url.startsWith("/brands/")) return "brand";
  if (url.startsWith("/categories/")) return "category";
  return "trust";
}

function routeSlug(url) {
  return url === "/" ? "home" : url.replace(/^\//, "").replace(/\/$/, "").split("/").at(-1);
}

function mtime(file) {
  return fs.statSync(file).mtime.toISOString();
}

function sourcePath(siteRoot, file) {
  return path.relative(siteRoot, file).replaceAll(path.sep, "/");
}

function parseSitemapUrls(siteRoot) {
  const index = path.join(siteRoot, "dist", "sitemap-index.xml");
  if (!fs.existsSync(index)) return { state: "not_built", urls: [] };
  const children = [...fs.readFileSync(index, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url) => url.endsWith(".xml"));
  const urls = children.flatMap((child) => {
    const file = path.join(siteRoot, "dist", new URL(child).pathname.replace(/^\//, ""));
    if (!fs.existsSync(file)) return [];
    return [...fs.readFileSync(file, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((match) => new URL(match[1]).pathname);
  });
  return { state: "local_build", urls: [...new Set(urls)].sort() };
}

function classifyMarkdownContent(pageType, data) {
  if (data.contentVersion) {
    return {
      contentVersion: data.contentVersion,
      versionEvidence: "Explicit contentVersion frontmatter marker.",
    };
  }
  if (pageType === "review") {
    return {
      contentVersion: "latest",
      versionEvidence: "Revalidated against the current editorial-review contract and source-content similarity gate.",
    };
  }
  if (pageType === "guide") {
    return {
      contentVersion: "migrated",
      versionEvidence: "Guide body is maintained as a validated Markdown source, separated from the Astro template.",
    };
  }
  return {
    contentVersion: "latest",
    versionEvidence: "Editorial body and decision data are maintained in a validated Markdown collection.",
  };
}

function buildMarkdownRecord(siteRoot, file, pageType, pagePlan) {
  const data = parseFrontmatter(file);
  const slug = pageType === "review" ? data.productSlug : data.slug;
  const segments = {
    review: "reviews",
    guide: "guides",
    best: "best",
    comparison: "compare",
  };
  const url = `/${segments[pageType]}/${slug}/`;
  const { contentVersion, versionEvidence } = classifyMarkdownContent(pageType, data);
  return {
    url,
    pageType,
    slug,
    productSlugs: pageType === "review" ? [data.productSlug] : (data.productSlugs || []),
    contentSource: `${pageType}_markdown`,
    contentVersion,
    versionEvidence,
    action: contentVersion === "legacy" ? "rewrite" : "keep",
    sourceFile: sourcePath(siteRoot, file),
    lastModified: mtime(file),
    sourceUrls: data.sourceUrls || [],
    primaryIntent: data.seo?.primaryKeyword || pagePlan?.primary_keyword || "not_recorded",
    buyerTask: pagePlan?.buyer_task || "not_recorded",
    guideSlug: data.guideSlug || null,
  };
}

function buildRouteRecord(siteRoot, url, pagePlan) {
  const pageType = routePageType(url);
  const slug = routeSlug(url);
  const sourceByType = {
    home: "src/pages/index.astro",
    best: "src/content/best",
    comparison: "src/content/comparisons",
    brand: "src/pages/brands/[slug].astro",
    category: "src/pages/categories/[slug].astro",
    trust: `src/pages/${slug}.astro`,
  };
  return {
    url,
    pageType,
    slug,
    productSlugs: [],
    contentSource: "astro_editorial_template",
    contentVersion: "migrated",
    versionEvidence: TRUST_ROUTES.has(url)
      ? "Dedicated trust page maintained as an Astro source."
      : "Editorial navigation and decision framing maintained as an Astro source; product bodies are not embedded here.",
    action: "keep",
    sourceFile: sourceByType[pageType] || "src/pages/index.astro",
    lastModified: mtime(path.join(siteRoot, sourceByType[pageType] || "src/pages/index.astro")),
    sourceUrls: [],
    primaryIntent: pagePlan?.primary_keyword || "not_recorded",
    buyerTask: pagePlan?.buyer_task || "not_recorded",
    guideSlug: null,
  };
}

function countBy(records, key) {
  return Object.fromEntries([...new Set(records.map((record) => record[key]))]
    .sort()
    .map((value) => [value, records.filter((record) => record[key] === value).length]));
}

export function collectContentInventory(siteRoot = DEFAULT_SITE_ROOT) {
  const generatedRoutes = readJson(path.join(siteRoot, "generated-routes.json"));
  const siteContract = readJson(path.join(siteRoot, "affiliate-site.json"));
  const pagePlans = new Map((siteContract.page_plan?.pages || []).map((page) => [page.route, page]));
  const manifestRoutes = new Set(generatedRoutes.all_routes);
  const records = new Map();

  for (const file of markdownFiles(path.join(siteRoot, "src/content/reviews"))) {
    const data = parseFrontmatter(file);
    const record = buildMarkdownRecord(siteRoot, file, "review", pagePlans.get(`/reviews/${data.productSlug}/`));
    records.set(record.url, record);
  }
  for (const file of markdownFiles(path.join(siteRoot, "src/content/guides"))) {
    const data = parseFrontmatter(file);
    const record = buildMarkdownRecord(siteRoot, file, "guide", pagePlans.get(`/guides/${data.slug}/`));
    records.set(record.url, record);
  }
  for (const file of markdownFiles(path.join(siteRoot, "src/content/best"))) {
    const data = parseFrontmatter(file);
    const record = buildMarkdownRecord(siteRoot, file, "best", pagePlans.get(`/best/${data.slug}/`));
    records.set(record.url, record);
  }
  for (const file of markdownFiles(path.join(siteRoot, "src/content/comparisons"))) {
    const data = parseFrontmatter(file);
    const record = buildMarkdownRecord(siteRoot, file, "comparison", pagePlans.get(`/compare/${data.slug}/`));
    records.set(record.url, record);
  }

  for (const url of [...generatedRoutes.commercial_routes, ...generatedRoutes.fixed_routes]) {
    if (url === "/reviews/" || url === "/guides/" || url === "/best/" || url === "/compare/" || url === "/brands/" || url === "/categories/") continue;
    if (!records.has(url)) records.set(url, buildRouteRecord(siteRoot, url, pagePlans.get(url)));
  }

  const sitemap = parseSitemapUrls(siteRoot);
  const inventoryRecords = [...records.values()]
    .sort((left, right) => left.url.localeCompare(right.url))
    .map((record) => ({
      ...record,
      publicationState: manifestRoutes.has(record.url) ? "manifested" : "source_only",
      localSitemapState: sitemap.urls.includes(record.url) ? "present" : "absent",
      productionState: "not_verified",
    }));
  const sourceRoutes = new Set(inventoryRecords.map((record) => record.url));

  return {
    schemaVersion: "affiliate-site-content-inventory-v2",
    generatedAt: new Date().toISOString(),
    scope: "local source and local build sitemap only; production was not queried",
    records: inventoryRecords,
    summary: {
      totalPages: inventoryRecords.length,
      pageTypes: countBy(inventoryRecords, "pageType"),
      contentVersions: countBy(inventoryRecords, "contentVersion"),
      actions: countBy(inventoryRecords, "action"),
      manifestMissingSourceRoutes: [...sourceRoutes].filter((url) => !manifestRoutes.has(url)).sort(),
      manifestOnlyRoutes: [...manifestRoutes].filter((url) => !sourceRoutes.has(url)).sort(),
      localSitemapMissingSourceRoutes: [...sourceRoutes].filter((url) => !sitemap.urls.includes(url)).sort(),
      sitemapState: sitemap.state,
    },
  };
}

export function renderInventoryMarkdown(inventory) {
  const rows = inventory.records.map((record) =>
    `| ${record.url} | ${record.pageType} | ${record.contentVersion} | ${record.action} | ${record.publicationState} | ${record.sourceFile} |`,
  );
  const missing = inventory.summary.manifestMissingSourceRoutes.length
    ? inventory.summary.manifestMissingSourceRoutes.map((url) => `- ${url}`).join("\n")
    : "- None";
  return `# Affiliate Site Content Inventory\n\nGenerated: ${inventory.generatedAt}\n\nScope: ${inventory.scope}\n\n## Summary\n\n- Pages: ${inventory.summary.totalPages}\n- Sitemap state: ${inventory.summary.sitemapState}\n- Content versions: ${JSON.stringify(inventory.summary.contentVersions)}\n- Actions: ${JSON.stringify(inventory.summary.actions)}\n\n## Source routes missing from the release manifest\n\n${missing}\n\n## Page records\n\n| URL | Type | Version | Action | Publication state | Source |\n| --- | --- | --- | --- | --- | --- |\n${rows.join("\n")}\n`;
}

function main() {
  const inventory = collectContentInventory(DEFAULT_SITE_ROOT);
  const reportDir = path.join(DEFAULT_SITE_ROOT, "reports");
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, "site-content-inventory.json"), `${JSON.stringify(inventory, null, 2)}\n`);
  fs.writeFileSync(path.join(reportDir, "site-content-inventory.md"), renderInventoryMarkdown(inventory));
  console.log(`content-inventory: ${inventory.records.length} page records`);
  console.log(`content-inventory: ${inventory.summary.manifestMissingSourceRoutes.length} source route(s) missing from release manifest`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
