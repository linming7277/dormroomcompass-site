import type { VerticalExtension } from "@/types";

/** Optional facts and modules; the core template never requires a vertical. */
export const verticalExtension: VerticalExtension = {
  vertical: "home",
  optionalFacts: ["dimensions", "installation", "maintenance"],
  optionalEditorialModules: ["fit checklist", "setup considerations"],
};
