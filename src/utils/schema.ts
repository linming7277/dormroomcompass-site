import { siteConfig } from "@/config/site.config";
import type { Category, Product } from "@/types";
import { absoluteUrl, getBrand } from "@/utils/data";

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url, siteConfig.url),
    })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: absoluteUrl(siteConfig.logo, siteConfig.url),
      sameAs: siteConfig.sameAs,
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo, siteConfig.url),
    sameAs: siteConfig.sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contactEmail,
      contactType: "customer support",
    },
  };
}

export function productSchema(product: Product) {
  const brand = getBrand(product.brandSlug);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.productName || product.name,
    image: absoluteUrl(product.image, siteConfig.url),
    description: product.bestFor,
  };

  if (brand) {
    schema.brand = {
      "@type": "Brand",
      name: brand.name,
    };
  }

  if (product.sku) {
    schema.sku = product.sku;
  }

  if (product.gtin) {
    schema.gtin = product.gtin;
  }

  if (product.offer?.price && product.offer?.priceCurrency) {
    schema.offers = {
      "@type": "Offer",
      url: product.merchantUrl,
      price: product.offer.price,
      priceCurrency: product.offer.priceCurrency,
      availability: product.offer.availability
        ? `https://schema.org/${product.offer.availability}`
        : undefined,
      priceValidUntil: product.offer.validUntil,
    };
  }

  if (
    product.reviewSummary?.ratingValue &&
    product.reviewSummary?.reviewCount
  ) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.reviewSummary.ratingValue,
      bestRating: product.reviewSummary.bestRating || 5,
      worstRating: 1,
      ratingCount: product.reviewSummary.reviewCount,
    };
  }

  if (product.evidence.testedByUs && product.reviewSummary?.summary) {
    schema.review = {
      "@type": "Review",
      author: {
        "@type": "Person",
        name: product.reviewSummary.authorName || siteConfig.author.name,
      },
      reviewBody: product.reviewSummary.summary,
      reviewRating: product.reviewSummary.ratingValue
        ? {
            "@type": "Rating",
            ratingValue: product.reviewSummary.ratingValue,
            bestRating: product.reviewSummary.bestRating || 5,
          }
        : undefined,
    };
  }

  return schema;
}

export function itemListSchema(category: Category, productItems: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.title,
    description: category.description,
    itemListElement: productItems.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/reviews/${product.slug}/`, siteConfig.url),
      name: product.productName || product.name,
    })),
  };
}

export function faqSchema(
  questions: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleSchema(article: {
  slug?: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
}, canonicalPath = article.slug ? `/guides/${article.slug}/` : "/") {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteConfig.logo, siteConfig.url),
      },
    },
    mainEntityOfPage: absoluteUrl(canonicalPath, siteConfig.url),
  };
}
