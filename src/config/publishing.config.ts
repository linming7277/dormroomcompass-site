import type { PublishingConfig } from "@/types";

export const publishingConfig: PublishingConfig = {
  indexingMode: "production",
  includeStagingInSitemap: false,
  maxNewPagesPerPublish: 25,
  requireHumanReviewBeforeProduction: true,
};
