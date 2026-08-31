import { editorialGuides, editorialReviews } from "@/data/editorialIndex";
import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import type { Product } from "@/types";

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getDisplayProductTitle(product: Product) {
  return product.displayTitle?.trim() || product.productName?.trim() || product.name;
}

export function getProductIdentity(product: Product) {
  return product.productName?.trim() || product.name;
}

export function getBrand(slug: string) {
  return brands.find((brand) => brand.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getBuyingGuide(slug: string) {
  return editorialGuides.find((guide) => guide.slug === slug);
}

export function getProductsByCategory(categorySlug: string) {
  return products.filter((product) =>
    product.categorySlugs.includes(categorySlug),
  );
}

export function getProductsByBrand(brandSlug: string) {
  return products.filter((product) => product.brandSlug === brandSlug);
}

export function getProductReview(productSlug: string) {
  return editorialReviews.find((review) => review.productSlug === productSlug);
}

export function getProductReadingPath(productSlug: string) {
  const review = getProductReview(productSlug);
  if (review) return `/reviews/${productSlug}/`;
  const product = getProduct(productSlug);
  const guideSlug = product?.categorySlugs
    .map((category) => editorialGuides.find((guide) => guide.categorySlug === category)?.slug)
    .find(Boolean);
  return guideSlug ? `/guides/${guideSlug}/` : "/guides/";
}

export function assertFound<T>(value: T | undefined, label: string): T {
  if (!value) {
    throw new Error(`${label} not found`);
  }

  return value;
}

export function absoluteUrl(path: string, siteUrl: string) {
  if (path.startsWith("http")) {
    return path;
  }

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
