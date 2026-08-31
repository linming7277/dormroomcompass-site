import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const thresholdArg = process.argv.find((value) => value.startsWith("--threshold="));
const threshold = Number(thresholdArg?.split("=")[1] || "0.35");
const enforce = process.argv.includes("--enforce");

function words(file) {
  return (fs.readFileSync(file, "utf8")
    .replace(/^---\s*[\s\S]*?\n---\s*/i, "")
    .toLowerCase()
    .match(/[a-z]+(?:['’-][a-z]+)*/g) || []);
}

function fiveGrams(tokens) {
  const grams = new Set();
  for (let index = 0; index + 5 <= tokens.length; index += 1) {
    grams.add(tokens.slice(index, index + 5).join(" "));
  }
  return grams;
}

function score(left, right) {
  let intersection = 0;
  for (const gram of left) if (right.has(gram)) intersection += 1;
  return intersection / (left.size + right.size - intersection || 1);
}

const findings = [];
for (const collection of ["reviews", "guides", "best", "comparisons"]) {
  const directory = path.join(root, "src/content", collection);
  const files = fs.readdirSync(directory).filter((file) => file.endsWith(".md")).sort();
  const grams = new Map(files.map((file) => [file, fiveGrams(words(path.join(directory, file)))]));
  for (let leftIndex = 0; leftIndex < files.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < files.length; rightIndex += 1) {
      const similarity = score(grams.get(files[leftIndex]), grams.get(files[rightIndex]));
      if (similarity >= threshold) {
        findings.push({
          collection,
          left: files[leftIndex],
          right: files[rightIndex],
          similarity,
        });
      }
    }
  }
}

findings.sort((left, right) => right.similarity - left.similarity);
for (const finding of findings) {
  console.log(
    `${(finding.similarity * 100).toFixed(1)}%  ${finding.collection}: ${finding.left} <> ${finding.right}`,
  );
}
if (findings.length === 0) console.log(`content-similarity: no pairs at or above ${(threshold * 100).toFixed(0)}%`);
else console.log(`content-similarity: ${findings.length} pair(s) at or above ${(threshold * 100).toFixed(0)}%`);

if (enforce && findings.length > 0) process.exit(1);
