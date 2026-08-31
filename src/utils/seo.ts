import { publishingConfig } from "@/config/publishing.config";

export function isProductionIndexing() {
  return publishingConfig.indexingMode === "production";
}

export function robotsMetaContent() {
  return isProductionIndexing() ? "index,follow" : "noindex,nofollow";
}

export function shouldExposeSitemap() {
  return isProductionIndexing() || publishingConfig.includeStagingInSitemap;
}

export function formatMetric(
  value: number | undefined,
  fallback = "Not collected",
) {
  return typeof value === "number" ? value.toLocaleString("en-US") : fallback;
}
