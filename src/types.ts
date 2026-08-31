export type LinkTarget = "_blank" | "_self";

export interface SiteNavItem {
  label: string;
  href: string;
  children?: SiteNavItem[];
}

export interface SiteConfig {
  name: string;
  url: string;
  favicon?: string;
  tagline: string;
  description: string;
  niche: string;
  audience: string;
  language: string;
  locale: string;
  author: {
    name: string;
    role: string;
  };
  contactEmail: string;
  logo: string;
  sameAs: string[];
  nav: SiteNavItem[];
  categoryNavSlugs: string[];
  trust: {
    evidenceLabel: string;
    promise: string;
    disclosure: string;
  };
  home: {
    featuredCategorySlug: string;
    featuredProductSlug: string;
    currentTopics: Array<{ label: string; href: string; description: string }>;
  };
  categories?: Array<{ slug: string; label: string }>;
  problemPaths?: Array<{ label: string; href: string; description: string }>;
  readerPaths?: Array<{ label: string; href: string; description: string }>;
  flagshipContent?: { label: string; href: string; description: string };
  homepageSections?: string[];
  publisher?: { name: string; url?: string };
  authors?: Array<{ name: string; role: string }>;
  affiliateDisclosure?: string;
  editorialPolicy?: string;
  aiTransparency?: string;
  analytics?: { enabled: boolean };
  merchantConfig?: { ctaLabel: string; defaultRel: string };
  social?: string[];
  footer?: { notice: string };
}

export interface VerticalExtension {
  vertical: string;
  optionalFacts: string[];
  optionalEditorialModules: string[];
}

export interface ThemeConfig {
  colors: {
    ink: string;
    muted: string;
    line: string;
    paper: string;
    surface: string;
    brand: string;
    brandStrong: string;
    accent: string;
    warning: string;
  };
}

export interface AffiliateConfig {
  disclosureShort: string;
  disclosureLong: string;
  defaultRel: string;
  ctaLabel: string;
  merchantLinkPolicy: string;
}

export interface MonetizationSlot {
  id: string;
  label: string;
  pageTypes: PageType[];
  provider: "affiliate" | "adsterra" | "monetag" | "partnerboost" | "custom";
  placement:
    "above-fold" | "after-intro" | "mid-content" | "sidebar" | "footer";
  enabled: boolean;
}

export interface MonetizationConfig {
  priority: Array<"affiliate" | "ads">;
  affiliateNetworks: Array<{
    name: string;
    status: "planned" | "applied" | "approved" | "rejected";
    note: string;
  }>;
  slots: MonetizationSlot[];
}

export interface PublishingConfig {
  indexingMode: "staging" | "production";
  includeStagingInSitemap: boolean;
  maxNewPagesPerPublish: number;
  requireHumanReviewBeforeProduction: boolean;
}

export interface Brand {
  slug: string;
  name: string;
  description: string;
  website?: string;
  sourceUrls?: string[];
}

export interface Category {
  slug: string;
  name: string;
  title: string;
  description: string;
  buyerIntent: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: SearchIntent;
  kgr?: number;
  monthlySearchVolume?: number;
  competitionNote: string;
  trendStatus: TrendStatus;
  priority: number;
  recommendedProductSlugs: string[];
  parentSlug?: string;
  subcategorySlugs?: string[];
  image?: string;
  featuredProductSlug?: string;
  sourceUrls?: string[];
}

export interface ProductEvidence {
  testedByUs: boolean;
  level?: "hands-on" | "merchant-verified" | "source-checked";
  sourceNotes: string[];
  sourceUrls: string[];
  imageRights:
    "owned" | "licensed" | "merchant-provided" | "generated" | "reference-only";
  factualLimits: string;
  lastChecked: string;
}

export interface ProductAward {
  label: string;
  rationale: string;
}

export interface ScoreDimension {
  label: string;
  value: number;
  max: number;
}

export type SearchIntent =
  "commercial" | "transactional" | "informational" | "comparison";

export type PageType =
  | "home"
  | "category"
  | "best"
  | "review"
  | "comparison"
  | "brand"
  | "guide"
  | "trust";

export type TrendStatus = "rising" | "stable" | "declining" | "unknown";

export interface SeoOpportunity {
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: SearchIntent;
  pageType: PageType;
  kgr?: number;
  monthlySearchVolume?: number;
  competitionNote: string;
  trendStatus: TrendStatus;
  priority: number;
}

export interface PerformanceFeedback {
  gscClicks7d?: number;
  gscImpressions7d?: number;
  gscCtr7d?: number;
  gscAvgPosition7d?: number;
  ga4Users7d?: number;
  lastOptimizedAt?: string;
  recommendedAction?:
    "keep" | "improve-title" | "expand-content" | "add-inner-pages" | "pause";
}

export interface ProductOffer {
  price?: string;
  priceCurrency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder" | "LimitedAvailability";
  validUntil?: string;
}

export interface ReviewSummary {
  ratingValue?: number;
  bestRating?: number;
  reviewCount?: number;
  summary?: string;
  authorName?: string;
}

export interface Product {
  slug: string;
  name: string;
  /** Portable data-contract aliases for generators and non-Astro consumers. */
  productName?: string;
  /** Concise factual identity for reader-facing cards and headings. */
  displayTitle?: string;
  brandSlug: string;
  brand?: string;
  categorySlugs: string[];
  category?: string;
  subcategory?: string;
  summary: string;
  bestFor: string;
  skipIf?: string;
  verdict?: string;
  award?: ProductAward;
  editorialScore?: number;
  scoreDimensions?: ScoreDimension[];
  priceNote: string;
  merchantUrl: string;
  affiliateUrl?: string;
  image: string;
  sku?: string;
  gtin?: string;
  offer?: ProductOffer;
  reviewSummary?: ReviewSummary;
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
  evidence: ProductEvidence;
  sourceUrls?: string[];
  seo: SeoOpportunity;
  feedback?: PerformanceFeedback;
  identifiers?: {
    asin?: string;
    sku?: string;
    model?: string;
    other?: string;
  };
  images?: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
    role?: "product" | "hero" | "thumbnail" | "gallery";
    sourceType?: string;
    provider?: string;
    sourceUrl?: string;
    rightsStatus?: string;
    allowedForUse?: boolean;
  }>;
  keyFacts?: Record<string, string>;
  merchantDynamicData?: {
    merchant: "Amazon";
    market: string;
    rating: number;
    ratingScale: number;
    ratingCount: number;
    checkedAt: string;
    sourceUrl: string;
    status: "fresh" | "stale" | "expired" | "unavailable" | "identity_mismatch";
  };
}

export interface ProductReview {
  productSlug: string;
  title: string;
  description: string;
  guideSlug: string;
  datePublished: string;
  dateModified: string;
  sourceUrls?: string[];
}

export interface BuyingGuide {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  productSlugs?: string[];
  sourceUrls?: string[];
  datePublished: string;
  dateModified: string;
  seo: SeoOpportunity;
  feedback?: PerformanceFeedback;
  questions: Array<{
    question: string;
    answer: string;
  }>;
  sections: Array<{
    heading: string;
    body: string;
  }>;
}

export interface PageMatrixRule {
  id: string;
  pageType: PageType;
  pattern: string;
  urlPattern: string;
  requiredFields: string[];
  monetizationGoal: "affiliate-click" | "lead" | "ad-rpm" | "email-capture";
  publishWhen: string;
}
