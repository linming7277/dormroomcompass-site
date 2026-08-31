import type { APIRoute } from "astro";
import { siteConfig } from "@/config/site.config";
import { isProductionIndexing, shouldExposeSitemap } from "@/utils/seo";

export const GET: APIRoute = () =>
  new Response(
    isProductionIndexing()
      ? [
          "User-agent: *",
          "Allow: /",
          "Disallow: /drafts/",
          "",
          shouldExposeSitemap()
            ? `Sitemap: ${siteConfig.url}/sitemap-index.xml`
            : "",
          "",
        ].join("\n")
      : [
          "# Staging mode is enabled in src/config/publishing.config.ts.",
          "# Switch indexingMode to production only after content, affiliate, analytics, and legal review.",
          "User-agent: *",
          "Disallow: /",
          "",
          shouldExposeSitemap()
            ? `Sitemap: ${siteConfig.url}/sitemap-index.xml`
            : "",
          "",
        ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
