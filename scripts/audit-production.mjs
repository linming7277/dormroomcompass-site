import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expect = (condition, message) => {
  console[condition ? "log" : "error"](`${condition ? "PASS" : "FAIL"} ${message}`);
  if (!condition) failures.push(message);
};
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const contract = JSON.parse(read("affiliate-site.json"));
const publishingConfig = read("src/config/publishing.config.ts");

expect(fs.existsSync(path.join(root, "dist")), "build output exists");
expect(contract.publishing?.mode === "staging", "sample contract is explicitly staging-only");
expect(contract.publishing?.noindex === true, "sample contract blocks indexing");
expect(/indexingMode:\s*["']staging["']/.test(publishingConfig), "runtime publishing mode is staging");

if (fs.existsSync(path.join(root, "dist"))) {
  const robots = read("dist/robots.txt");
  const html = read("dist/index.html");
  expect(robots.includes("Disallow: /"), "robots.txt blocks crawlers for the demo");
  expect(html.includes('content="noindex,nofollow"'), "HTML emits noindex,nofollow for the demo");
  expect(!fs.existsSync(path.join(root, "dist/sitemap-index.xml")), "staging build exposes no sitemap");
}

if (failures.length) process.exit(1);
