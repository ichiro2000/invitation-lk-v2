// Plan pricing is server-side truth — never derive amount from the client.
// Values are in LKR (whole rupees).
export const PLAN_AMOUNTS: Record<string, number> = {
  BASIC: 2500,
  STANDARD: 5000,
  PREMIUM: 10000,
};

export const PLAN_NAMES: Record<string, string> = {
  BASIC: "Basic Plan",
  STANDARD: "Standard Plan",
  PREMIUM: "Premium Plan",
};

// Higher rank = higher tier. Used to prevent downgrades through stale orders.
export const PLAN_RANK: Record<string, number> = {
  FREE: 0,
  BASIC: 1,
  STANDARD: 2,
  PREMIUM: 3,
};

// How many invitations a plan can have published at once. Drafts are unlimited.
export const PLAN_PUBLISH_LIMIT: Record<string, number> = {
  FREE: 0,
  BASIC: 1,
  STANDARD: 2,
  PREMIUM: 3,
};

// Pay-the-difference when upgrading. If the target tier is the same or lower
// than the user's current tier, return 0 — callers should gate on that and
// reject the order rather than charging. New (FREE) users pay the full sticker.
export function getUpgradeAmount(
  currentPlan: string | null | undefined,
  targetPlan: string
): number {
  const currentPrice = currentPlan ? PLAN_AMOUNTS[currentPlan] ?? 0 : 0;
  const targetPrice = PLAN_AMOUNTS[targetPlan] ?? 0;
  const diff = targetPrice - currentPrice;
  return diff > 0 ? diff : 0;
}

// True when `target` is strictly higher tier than `current`. Use to gate the
// checkout routes so a stale client can't trick us into charging 0 for a
// downgrade/equal-tier "upgrade".
export function isUpgrade(
  currentPlan: string | null | undefined,
  targetPlan: string
): boolean {
  const currentRank = currentPlan ? PLAN_RANK[currentPlan] ?? 0 : 0;
  const targetRank = PLAN_RANK[targetPlan] ?? 0;
  return targetRank > currentRank;
}
