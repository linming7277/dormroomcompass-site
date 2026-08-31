import type { PageMatrixRule } from "@/types";

export const pageMatrix: PageMatrixRule[] = [
  { id: "review", pageType: "review", pattern: "product decision", urlPattern: "/reviews/{productSlug}/", requiredFields: ["productSlug", "guideSlug", "sourceUrls", "bestFor", "skipIf"], monetizationGoal: "affiliate-click", publishWhen: "product and content contracts pass" },
  { id: "best", pageType: "best", pattern: "shortlist", urlPattern: "/best/{slug}/", requiredFields: ["picks", "sourceUrls"], monetizationGoal: "affiliate-click", publishWhen: "editorial contract passes" },
  { id: "comparison", pageType: "comparison", pattern: "decision matrix", urlPattern: "/compare/{slug}/", requiredFields: ["productSlugs", "decisionDimensions", "decisionPaths"], monetizationGoal: "affiliate-click", publishWhen: "editorial contract passes" },
  { id: "guide", pageType: "guide", pattern: "buyer education", urlPattern: "/guides/{slug}/", requiredFields: ["categorySlug", "sourceUrls"], monetizationGoal: "affiliate-click", publishWhen: "editorial contract passes" },
];
