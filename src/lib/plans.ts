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
