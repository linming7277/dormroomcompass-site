import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Editorial content collections.
 *
 * Frontmatter is written in JSON syntax (a subset of YAML), so it parses
 * identically in Astro (js-yaml) and in the Python contract validator
 * (`json.loads`) — zero dependency either side.
 *
 * There is deliberately NO `sections` field: section headings and bodies live
 * in the markdown body as `## heading` blocks (rendered via <Content />).
 */

const seoSchema = z.object({
  primaryKeyword: z.string(),
  secondaryKeywords: z.array(z.string()).optional(),
  searchIntent: z.enum([
    "commercial",
    "transactional",
    "informational",
    "comparison",
  ]),
  pageType: z.enum([
    "home",
    "category",
    "best",
    "review",
    "comparison",
    "brand",
    "guide",
    "trust",
  ]),
  kgr: z.number().optional(),
  monthlySearchVolume: z.number().optional(),
  competitionNote: z.string().optional(),
  trendStatus: z
    .enum(["rising", "stable", "declining", "unknown"])
    .optional(),
  priority: z.number().optional(),
});

const guideSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  categorySlug: z.string(),
  productSlugs: z.array(z.string()).optional(),
  sourceUrls: z.array(z.string().url()).min(1),
  datePublished: z.string(),
  dateModified: z.string(),
  seo: seoSchema,
  questions: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
});

const sourceUrlsSchema = z.array(z.string().url()).min(1);

const bestPickSchema = z.object({
  productSlug: z.string(),
  label: z.string(),
  selectionReason: z.string(),
  bestFor: z.string(),
  tradeoff: z.string(),
  skipIf: z.string(),
});

const bestSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  categorySlug: z.string(),
  contentMode: z.enum(["multi-brand-best", "brand-format-guide"]),
  productSlugs: z.array(z.string()).min(3),
  picks: z.array(bestPickSchema).min(3),
  selectionCriteria: z.array(z.string()).min(3),
  datePublished: z.string(),
  dateModified: z.string(),
  sourceUrls: sourceUrlsSchema,
  seo: seoSchema,
});

const comparisonSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  categorySlug: z.string(),
  productSlugs: z.array(z.string()).min(2),
  decisionDimensions: z.array(z.object({ label: z.string(), question: z.string() })).min(3),
  decisionPaths: z.array(z.object({ label: z.string(), condition: z.string() })).min(3),
  datePublished: z.string(),
  dateModified: z.string(),
  sourceUrls: sourceUrlsSchema,
  seo: seoSchema,
});

const reviewSchema = z.object({
  productSlug: z.string(),
  title: z.string(),
  description: z.string(),
  guideSlug: z.string(),
  decision: z.object({
    headline: z.string(),
    bestFit: z.string(),
    skipIf: z.string(),
  }),
  datePublished: z.string(),
  dateModified: z.string(),
  sourceUrls: z.array(z.string().url()).min(1),
});

export const collections = {
  guides: defineCollection({
    loader: glob({ base: "./src/content/guides", pattern: "**/*.md" }),
    schema: guideSchema,
  }),
  reviews: defineCollection({
    loader: glob({ base: "./src/content/reviews", pattern: "**/*.md" }),
    schema: reviewSchema,
  }),
  bestPicks: defineCollection({
    loader: glob({ base: "./src/content/best", pattern: "**/*.md" }),
    schema: bestSchema,
  }),
  comparisons: defineCollection({
    loader: glob({ base: "./src/content/comparisons", pattern: "**/*.md" }),
    schema: comparisonSchema,
  }),
};
