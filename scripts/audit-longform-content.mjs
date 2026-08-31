import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const minimumWords = 1000;
const isStagingDemo = /indexingMode:\s*["']staging["']/.test(
  fs.readFileSync(path.join(root, "src/config/publishing.config.ts"), "utf8"),
);
const routes = JSON.parse(
  fs.readFileSync(path.join(root, "generated-routes.json"), "utf8"),
).all_routes.filter(
  (route) =>
    /^\/guides\/[^/]+\/$/.test(route) || /^\/reviews\/[^/]+\/$/.test(route),
);

function routePath(route) {
  return path.join(root, "dist", route.replace(/^\//, ""), "index.html");
}

function wordCount(html) {
  const article = html.match(/<article[\s\S]*?<\/article>/)?.[0] || html;
  const text = article
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ");
  return (text.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || []).length;
}

const failures = [];
for (const route of routes) {
  const count = wordCount(fs.readFileSync(routePath(route), "utf8"));
  if (!isStagingDemo && count < minimumWords) failures.push({ route, count });
  console.log(`${count} words  ${route}`);
}

if (isStagingDemo) {
  console.log(`Long-form audit: ${routes.length} staging demo articles exempt from the ${minimumWords}-word production minimum.`);
  process.exit(0);
}

if (failures.length > 0) {
  console.error(`Long-form audit failed: every article requires at least ${minimumWords} words.`);
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(`Long-form audit passed: ${routes.length} articles meet the ${minimumWords}-word minimum.`);
