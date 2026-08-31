import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceRoot = join(root, "src");
const reportRoot = join(root, "reports", "template-v2");

async function filesUnder(directory, predicate = () => true) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return filesUnder(path, predicate);
    return predicate(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

function asProjectPath(path) {
  return relative(root, path).replaceAll("\\", "/");
}

function routeFor(path) {
  const route = asProjectPath(path).replace(/^src\/pages/, "").replace(/\.astro$/, "").replace(/\/index$/, "/");
  return route === "" ? "/" : route.endsWith("/") ? route : `${route}/`;
}

const [pageFiles, componentFiles, contentFiles, productFiles] = await Promise.all([
  filesUnder(join(sourceRoot, "pages"), (name) => name.endsWith(".astro")),
  filesUnder(join(sourceRoot, "components"), (name) => name.endsWith(".astro")),
  filesUnder(join(sourceRoot, "content"), (name) => name.endsWith(".md")),
  filesUnder(join(sourceRoot, "data", "products"), (name) => name.endsWith(".ts")),
]);

const routeInventory = {
  generatedAt: new Date().toISOString(),
  routes: pageFiles.sort().map((path) => ({ route: routeFor(path), source: asProjectPath(path) })),
};
const componentInventory = {
  generatedAt: new Date().toISOString(),
  components: componentFiles.sort().map(asProjectPath),
};
const contentInventory = {
  generatedAt: new Date().toISOString(),
  content: contentFiles.sort().map(asProjectPath),
  productData: productFiles.sort().map(asProjectPath),
  counts: {
    reviews: contentFiles.filter((path) => path.includes("/reviews/")).length,
    guides: contentFiles.filter((path) => path.includes("/guides/")).length,
    best: contentFiles.filter((path) => path.includes("/best/")).length,
    comparisons: contentFiles.filter((path) => path.includes("/comparisons/")).length,
    products: productFiles.length,
  },
};

await mkdir(reportRoot, { recursive: true });
await Promise.all([
  writeFile(join(reportRoot, "current-route-inventory.json"), `${JSON.stringify(routeInventory, null, 2)}\n`),
  writeFile(join(reportRoot, "current-component-inventory.json"), `${JSON.stringify(componentInventory, null, 2)}\n`),
  writeFile(join(reportRoot, "current-content-inventory.json"), `${JSON.stringify(contentInventory, null, 2)}\n`),
]);

console.log(`Template V2 inventory: ${routeInventory.routes.length} routes, ${componentInventory.components.length} components, ${contentFiles.length} editorial files, ${productFiles.length} product files.`);
