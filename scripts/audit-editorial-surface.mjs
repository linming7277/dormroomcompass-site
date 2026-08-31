import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const prohibitedPublicTerms = [
  /\bapproved fact\b/i,
  /\bmerchant destination\b/i,
  /\bshortlisted\b/i,
  /\bapi record\b/i,
  /\bsource-checked merchant record\b/i,
  /\bsource-bound\b/i,
  /\bsource-checked\b/i,
  /\bmerchant record\b/i,
  /\baffiliate record\b/i,
  /\baffiliate api\b/i,
];

export function auditHtmlPages(pages) {
  const failures = [];
  const ctaCounts = [];

  for (const { route, html } of pages) {
    for (const expression of prohibitedPublicTerms) {
      if (expression.test(html)) {
        failures.push(`${route}: exposes internal term ${expression}`);
      }
    }

    const merchantCtas = (html.match(/rel="sponsored nofollow noopener"/g) || [])
      .length;
    ctaCounts.push({ route, merchantCtas });

    const mustStayInternal =
      route === "/" ||
      route.startsWith("/categories/") ||
      route.startsWith("/brands/") ||
      route.startsWith("/guides/");
    if (mustStayInternal && merchantCtas > 0) {
      failures.push(
        `${route}: has ${merchantCtas} merchant CTA(s); this page type must link to decision context instead`,
      );
    }
    if (route !== "/reviews/" && route.startsWith("/reviews/") && (merchantCtas < 1 || merchantCtas > 3)) {
      failures.push(`${route}: has ${merchantCtas} merchant CTA(s); review limit is 1–3`);
    }
    if (route !== "/best/" && route.startsWith("/best/") && merchantCtas > 9) {
      failures.push(`${route}: has ${merchantCtas} merchant CTA(s); best pages must not exceed one per decision unit plus a top pick`);
    }
    if (route !== "/compare/" && route.startsWith("/compare/") && (merchantCtas < 2 || merchantCtas > 3)) {
      failures.push(`${route}: has ${merchantCtas} merchant CTA(s); comparison pages need 2–3 decision CTAs`);
    }
  }

  return { failures, ctaCounts };
}

function routeForFile(distPath, fullPath) {
  const relative = path.relative(distPath, fullPath);
  if (relative === "index.html") return "/";
  return `/${relative.replace(/\/index\.html$/, "/").replace(/index\.html$/, "")}`;
}

export function loadBuiltPages(distPath) {
  const pages = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      if (entry.isFile() && entry.name === "index.html") {
        pages.push({
          route: routeForFile(distPath, fullPath),
          html: fs.readFileSync(fullPath, "utf8"),
        });
      }
    }
  };
  walk(distPath);
  return pages;
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const root = process.cwd();
  const distPath = path.join(root, "dist");
  if (!fs.existsSync(distPath)) {
    console.error("editorial-surface audit requires a completed build in dist/");
    process.exit(1);
  }

  const result = auditHtmlPages(loadBuiltPages(distPath));
  for (const { route, merchantCtas } of result.ctaCounts) {
    console.log(`CTA ${route}: ${merchantCtas}`);
  }
  if (result.failures.length) {
    for (const failure of result.failures) console.error(`FAIL ${failure}`);
    process.exit(1);
  }
  console.log(`editorial-surface audit passed: ${result.ctaCounts.length} pages`);
}
