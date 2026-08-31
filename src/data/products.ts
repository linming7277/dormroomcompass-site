import type { Product } from "@/types";

/**
 * Product factual records live as one file per product in
 * src/data/products/{slug}.ts. Adding or updating a product means dropping
 * a file there — no other registration is required.
 */
const modules = import.meta.glob<{ product: Product }>("./products/*.ts", {
  eager: true,
});

export const products: Product[] = Object.values(modules)
  .map((mod) => mod.product)
  .sort((a, b) => a.slug.localeCompare(b.slug));
