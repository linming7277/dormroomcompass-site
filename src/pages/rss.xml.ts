import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { products } from "@/data/products";
import { siteConfig } from "@/config/site.config";

export const GET: APIRoute = async (context) => {
  const guides = await getCollection("guides");

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site || siteConfig.url,
    items: [
      ...products.map((product) => ({
        title: `${product.name} Review`,
        description: product.summary,
        link: `/reviews/${product.slug}/`,
      })),
      ...guides.map((guide) => ({
        title: guide.data.title,
        description: guide.data.description,
        link: `/guides/${guide.data.slug}/`,
      })),
    ],
  });
};
