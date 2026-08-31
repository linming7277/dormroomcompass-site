import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contractPath = path.join(root, "affiliate-site.json");
const manifestPath = path.join(root, "generated-routes.json");

export function deriveRouteManifest(contract, previousManifest) {
  if (contract.template_version === "v2") {
    const markdownSlugs = (collection) => {
      const directory = path.join(root, "src", "content", collection);
      if (!fs.existsSync(directory)) return [];
      return fs.readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        .map((entry) => path.basename(entry.name, ".md"));
    };
    const productDirectory = path.join(root, "src", "data", "products");
    const productSlugs = fs.existsSync(productDirectory)
      ? fs.readdirSync(productDirectory, { withFileTypes: true })
          .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
          .map((entry) => path.basename(entry.name, ".ts"))
      : [];
    const slugsFromData = (filename) => {
      const source = fs.readFileSync(path.join(root, "src", "data", filename), "utf8");
      return [...source.matchAll(/"slug"\s*:\s*"([^"]+)"/g)].map((match) => match[1]);
    };
    const commercialRoutes = [...new Set([
      ...productSlugs.map((slug) => `/reviews/${slug}/`),
      ...markdownSlugs("guides").map((slug) => `/guides/${slug}/`),
      ...markdownSlugs("best").map((slug) => `/best/${slug}/`),
      ...markdownSlugs("comparisons").map((slug) => `/compare/${slug}/`),
      ...slugsFromData("categories.ts").map((slug) => `/categories/${slug}/`),
      ...slugsFromData("brands.ts").map((slug) => `/brands/${slug}/`),
    ])].sort();
    const fixedRoutes = [...new Set(previousManifest.fixed_routes || [])].sort();
    return {
      schema_version: "affiliate-generated-routes-v1",
      commercial_routes: commercialRoutes,
      fixed_routes: fixedRoutes,
      all_routes: [...new Set([...commercialRoutes, ...fixedRoutes])].sort(),
    };
  }
  const commercialRoutes = [...new Set(
    (contract.page_plan?.pages || [])
      .map((page) => page.route)
      .filter((route) => typeof route === "string" && route !== "/"),
  )].sort();
  const fixedRoutes = [...new Set(previousManifest.fixed_routes || [])].sort();
  return {
    schema_version: "affiliate-generated-routes-v1",
    commercial_routes: commercialRoutes,
    fixed_routes: fixedRoutes,
    all_routes: [...new Set([...commercialRoutes, ...fixedRoutes])].sort(),
  };
}

function main() {
  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  const previous = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const next = deriveRouteManifest(contract, previous);
  fs.writeFileSync(manifestPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(
    `sync-route-manifest: ${next.commercial_routes.length} commercial routes -> ${path.relative(root, manifestPath)}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
