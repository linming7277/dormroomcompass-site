import fs from "node:fs";
import path from "node:path";

const rootArg = process.argv.indexOf("--root");
const root = rootArg === -1 ? process.cwd() : path.resolve(process.argv[rootArg + 1] || "");

function listFiles(directory, suffix) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(file, suffix);
    return entry.isFile() && entry.name.endsWith(suffix) ? [file] : [];
  });
}

function readFrontmatter(file) {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error("missing JSON frontmatter");
  return JSON.parse(match[1]);
}

function listGuideSlugs() {
  const markdownGuides = listFiles(path.join(root, "src/content/guides"), ".md")
    .map((file) => path.basename(file, ".md"));
  if (markdownGuides.length > 0) return new Set(markdownGuides);

  const contentPlan = path.join(root, "src/data/contentPlan.ts");
  if (!fs.existsSync(contentPlan)) return new Set();
  const source = fs.readFileSync(contentPlan, "utf8");
  return new Set([...source.matchAll(/\bslug:\s*["']([^"']+)["']/g)].map((match) => match[1]));
}

function isValidUrl(value) {
  if (typeof value !== "string") return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const productSlugs = new Set(
  listFiles(path.join(root, "src/data/products"), ".ts")
    .map((file) => path.basename(file, ".ts")),
);
const guideSlugs = listGuideSlugs();
const errors = [];

for (const file of listFiles(path.join(root, "src/content/reviews"), ".md").sort()) {
  const filename = path.basename(file, ".md");
  let review;
  try {
    review = readFrontmatter(file);
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
    continue;
  }

  if (filename !== review.productSlug) {
    errors.push(`${file}: filename must equal productSlug (${review.productSlug || "missing"})`);
  }
  if (!productSlugs.has(review.productSlug)) {
    errors.push(`${file}: productSlug does not exist in src/data/products (${review.productSlug || "missing"})`);
  }
  if (!guideSlugs.has(review.guideSlug)) {
    errors.push(`${file}: guideSlug does not reference an existing guide (${review.guideSlug || "missing"})`);
  }
  if (!review.decision || !["headline", "bestFit", "skipIf"].every((key) => typeof review.decision[key] === "string" && review.decision[key].trim())) {
    errors.push(`${file}: decision must include non-empty headline, bestFit, and skipIf fields`);
  }
  if (!Array.isArray(review.sourceUrls) || review.sourceUrls.length === 0) {
    errors.push(`${file}: sourceUrls must contain at least one URL`);
  } else if (review.sourceUrls.some((url) => !isValidUrl(url))) {
    errors.push(`${file}: sourceUrls must contain only valid URLs`);
  }
}

if (errors.length > 0) {
  process.stderr.write(`Review content validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}\n`);
  process.exitCode = 1;
} else {
  console.log(`validate-review-content: ${productSlugs.size} products, ${guideSlugs.size} guides, reviews valid`);
}
