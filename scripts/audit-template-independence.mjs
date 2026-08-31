import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanRoots = ["src", "public", "contracts", "affiliate-site.json", "CONTENT-CONTRACT.md", "PRODUCT.md", "DESIGN.md"];
const forbidden = [
  /beauty guide lab/i,
  /beautyguidelab\.site/i,
  /skintific/i,
  /blackhead/i,
  /hair-care/i,
  /skincare/i,
  /G-Q827F26L9E/i,
];
const textExtensions = new Set([".astro", ".ts", ".md", ".json", ".svg", ".css"]);
const files = [];

function collect(target) {
  const full = path.join(root, target);
  if (!fs.existsSync(full)) return;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(full)) collect(path.join(target, entry));
    return;
  }
  if (textExtensions.has(path.extname(full))) files.push(full);
}

for (const target of scanRoots) collect(target);
const hits = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const term of forbidden) {
    if (term.test(text)) hits.push(`${path.relative(root, file)}: ${term}`);
  }

  if (path.extname(file) === ".astro") {
    if (/<a\b[^>]*\bhref\s*=\s*(?:\{\s*)?["']https?:\/\/(?:www\.)?amazon\.com\/dp\//i.test(text)) {
      hits.push(`${path.relative(root, file)}: hardcoded Amazon commercial merchant anchor`);
    }
    if (/<MerchantCTA\b[\s\S]{0,1200}?\bhref\s*=\s*(?:\{\s*)?["']https?:\/\/(?:www\.)?amazon\.com\/dp\//i.test(text)) {
      hits.push(`${path.relative(root, file)}: hardcoded Amazon commercial MerchantCTA`);
    }
  }

  if (path.extname(file) === ".ts" && /\b(?:merchantUrl|affiliateUrl)\b\s*[:"]\s*(?:\"\s*)?https?:\/\/(?:www\.)?amazon\.com\/dp\//i.test(text)) {
    hits.push(`${path.relative(root, file)}: product merchant destination must not be a raw Amazon URL`);
  }
}

if (hits.length) {
  console.error(`Template independence audit failed:\n${hits.map((hit) => `- ${hit}`).join("\n")}`);
  process.exit(1);
}
console.log(`Template independence audit passed: ${files.length} source, configuration, demo-data, and asset files scanned.`);
