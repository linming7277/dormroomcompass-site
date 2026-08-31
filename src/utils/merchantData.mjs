const DAY_MS = 86_400_000;

export function getMerchantRatingDisplay(data, now = new Date()) {
  const hidden = { display: false, label: "Amazon rating", freshness: "unavailable" };
  if (!data || data.merchant !== "Amazon") return hidden;
  const rating = Number(data.rating);
  const scale = Number(data.ratingScale || 5);
  const count = Number(data.ratingCount);
  const checkedAt = new Date(data.checkedAt);
  if (!Number.isFinite(rating) || rating <= 0 || rating > scale || !Number.isFinite(count) || count <= 0) return hidden;
  if (!data.sourceUrl || Number.isNaN(checkedAt.getTime())) return hidden;
  if (["expired", "unavailable", "identity_mismatch"].includes(data.status)) {
    return { ...hidden, freshness: data.status };
  }
  const ageDays = Math.max(0, (now.getTime() - checkedAt.getTime()) / DAY_MS);
  const freshness = ageDays <= 7 ? "fresh" : ageDays <= 30 ? "stale" : "expired";
  return {
    display: freshness !== "expired",
    label: "Amazon rating",
    freshness,
    merchant: data.merchant,
    rating,
    ratingScale: scale,
    ratingCount: count,
    checkedAt: data.checkedAt,
    sourceUrl: data.sourceUrl,
  };
}
