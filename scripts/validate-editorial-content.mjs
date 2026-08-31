import fs from "node:fs";
import path from "node:path";

const rootArg = process.argv.indexOf("--root");
const root = rootArg === -1 ? process.cwd() : path.resolve(process.argv[rootArg + 1] || "");

function files(directory, suffix = ".md") {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return files(fullPath, suffix);
    return entry.isFile() && entry.name.endsWith(suffix) ? [fullPath] : [];
  });
}

function readFrontmatter(file) {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("missing JSON frontmatter");
  return { data: JSON.parse(match[1]), body: match[2] };
}

function isUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateCommon({ file, data, body, productSlugs, errors }) {
  if (path.basename(file, ".md") !== data.slug) errors.push(`${file}: filename must equal slug`);
  if (!Array.isArray(data.sourceUrls) || data.sourceUrls.length === 0 || data.sourceUrls.some((url) => !isUrl(url))) {
    errors.push(`${file}: sourceUrls must contain at least one valid URL`);
  }
  if (/^#(?!#)/m.test(body)) errors.push(`${file}: markdown body must not contain H1`);
  for (const slug of data.productSlugs || []) {
    if (!productSlugs.has(slug)) errors.push(`${file}: productSlug does not exist (${slug})`);
  }
}

const productSlugs = new Set(
  files(path.join(root, "src/data/products"), ".ts").map((file) =>
    path.basename(file, ".ts"),
  ),
);
const categorySlugs = new Set(
  [...fs.readFileSync(path.join(root, "src/data/categories.ts"), "utf8").matchAll(/(?:"slug"|slug):\s*"([^"]+)"/g)]
    .map((match) => match[1]),
);
const errors = [];

for (const file of files(path.join(root, "src/content/guides")).sort()) {
  let parsed;
  try {
    parsed = readFrontmatter(file);
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
    continue;
  }
  const { data, body } = parsed;
  validateCommon({ file, data, body, productSlugs, errors });
  if (!categorySlugs.has(data.categorySlug)) errors.push(`${file}: categorySlug does not exist (${data.categorySlug})`);
}

for (const collection of ["best", "comparisons"]) {
  for (const file of files(path.join(root, `src/content/${collection}`)).sort()) {
    let parsed;
    try {
      parsed = readFrontmatter(file);
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
      continue;
    }
    const { data, body } = parsed;
    validateCommon({ file, data, body, productSlugs, errors });
    if (collection === "best") {
      if (!Array.isArray(data.picks) || data.picks.length < 3) errors.push(`${file}: best page needs at least three picks`);
      for (const pick of data.picks || []) {
        if (!data.productSlugs?.includes(pick.productSlug)) errors.push(`${file}: pick productSlug must be listed in productSlugs (${pick.productSlug})`);
        if (typeof pick.bestFor !== "string" || !pick.bestFor.trim()) errors.push(`${file}: every pick needs a non-empty bestFor`);
        if (typeof pick.skipIf !== "string" || !pick.skipIf.trim()) errors.push(`${file}: every pick needs a non-empty skipIf`);
      }
      const brands = new Set((data.productSlugs || []).map((slug) => slug.replace(/-\d+$/, "")));
      if (data.contentMode !== "brand-format-guide" && brands.size < 2) errors.push(`${file}: single-brand selection must use contentMode brand-format-guide`);
      if (!Array.isArray(data.selectionCriteria) || data.selectionCriteria.length < 3) errors.push(`${file}: best page needs three selection criteria`);
    } else {
      if (!Array.isArray(data.decisionDimensions) || data.decisionDimensions.length < 3) errors.push(`${file}: comparison needs at least three decision dimensions`);
      if (!Array.isArray(data.decisionPaths) || data.decisionPaths.length < 3) errors.push(`${file}: comparison needs Choose A, Choose B, and neither paths`);
    }
  }
}

if (errors.length) {
  console.error(`Editorial content validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}
console.log(`validate-editorial-content: ${productSlugs.size} products, ${categorySlugs.size} categories, editorial collections valid`);
