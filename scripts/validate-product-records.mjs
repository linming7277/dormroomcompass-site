import fs from "node:fs";
import path from "node:path";

const rootArg = process.argv.indexOf("--root");
const root = rootArg === -1 ? process.cwd() : path.resolve(process.argv[rootArg + 1] || "");

function files(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : entry.isFile() && entry.name.endsWith(".ts") ? [file] : [];
  });
}

function hasStringField(source, field) {
  return new RegExp(`(?:["']${field}["']|\\b${field}\\b)\\s*:\\s*["'][^"']+`, "m").test(source);
}

function hasImage(source) {
  return hasStringField(source, "image") || /["']src["']\s*:\s*["'][^"']+/.test(source);
}

const errors = [];
const productFiles = files(path.join(root, "src/data/products"));
for (const file of productFiles) {
  const source = fs.readFileSync(file, "utf8");
  const demo = /(?:["']status["']|\bstatus\b)\s*:\s*["']demo["']/.test(source);
  const label = path.relative(root, file);
  if (!hasStringField(source, "name") || !hasStringField(source, "productName")) {
    errors.push(`${label}: product identity requires name and productName`);
  }
  if (!hasStringField(source, "affiliateUrl") && !hasStringField(source, "merchantUrl")) {
    errors.push(`${label}: product needs an approved merchant destination`);
  }
  if (!hasImage(source)) errors.push(`${label}: product needs an image`);
  if (!demo && hasImage(source)) {
    for (const field of ["sourceType", "provider", "sourceUrl", "rightsStatus", "allowedForUse"]) {
      if (!new RegExp(`(?:["']${field}["']|\\b${field}\\b)\\s*:`, "m").test(source)) {
        errors.push(`${label}: production image needs ${field}`);
      }
    }
    if (!/(?:["']allowedForUse["']|\ballowedForUse\b)\s*:\s*true/.test(source)) {
      errors.push(`${label}: production image must be allowedForUse`);
    }
  }
}

if (errors.length) {
  process.stderr.write(`Product record validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}\n`);
  process.exitCode = 1;
} else {
  console.log(`validate-product-records: ${productFiles.length} products valid`);
}
