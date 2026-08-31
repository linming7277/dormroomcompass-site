import type { MonetizationConfig } from "@/types";

export const monetizationConfig: MonetizationConfig = {
  priority: ["affiliate", "ads"],
  affiliateNetworks: [
    {
      name: "Primary merchant program",
      status: "planned",
      note: "Replace with approved advertiser or network status before production publishing.",
    },
  ],
  slots: [
    {
      id: "review-primary-cta",
      label: "Primary merchant CTA on review pages",
      pageTypes: ["review"],
      provider: "affiliate",
      placement: "above-fold",
      enabled: true,
    },
    {
      id: "comparison-table-cta",
      label: "Comparison table merchant CTAs",
      pageTypes: ["best", "category", "comparison"],
      provider: "affiliate",
      placement: "mid-content",
      enabled: true,
    },
    {
      id: "optional-adsterra-display",
      label: "Optional low-interruption Adsterra display slot",
      pageTypes: ["guide", "category", "best"],
      provider: "adsterra",
      placement: "mid-content",
      enabled: false,
    },
    {
      id: "optional-monetag-display",
      label: "Optional low-interruption Monetag display slot",
      pageTypes: ["guide", "category", "best"],
      provider: "monetag",
      placement: "mid-content",
      enabled: false,
    },
  ],
};
