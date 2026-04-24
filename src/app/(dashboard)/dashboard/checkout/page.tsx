"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Building2,
  Upload,
  CheckCircle,
  Loader2,
  Crown,
  AlertTriangle,
  Globe,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

type PlanDef = {
  id: "BASIC" | "STANDARD" | "PREMIUM";
  name: string;
  price: number;
  tagline: string;
  features: string[];
};

const plans: PlanDef[] = [
  {
    id: "BASIC",
    name: "Basic",
    price: 2500,
    tagline: "For a simple digital invite",
    features: ["1 Template", "Up to 100 Guests", "Digital Invitation"],
  },
  {
    id: "STANDARD",
    name: "Standard",
    price: 5000,
    tagline: "Our most popular choice",
    features: ["All Templates", "Up to 500 Guests", "Wedding Tools"],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: 10000,
    tagline: "Everything, unlimited",
    features: ["All Templates", "Unlimited Guests", "Priority Support"],
  },
];

const planRank: Record<string, number> = { FREE: 0, BASIC: 1, STANDARD: 2, PREMIUM: 3, ADMIN: 4 };

// Module-level guard — survives re-mount cycles triggered by update(). See
// VerifyEmailBanner in the (dashboard) layout for the same pattern.
let checkoutHasRefreshed = false;

// Price to charge for an upgrade from currentPlan → targetPlan. Mirrors
// getUpgradeAmount in src/lib/plans.ts; the API is the source of truth.
function upgradePrice(userPlan: string, targetPlanId: string): number {
  const currentPlanEntry = plans.find((p) => p.id === userPlan);
  const targetPlanEntry = plans.find((p) => p.id === targetPlanId);
  if (!targetPlanEntry) return 0;
  const credit = currentPlanEntry?.price ?? 0;
  return Math.max(0, targetPlanEntry.price - credit);
}

function titleCase(s: string) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function CheckoutContent() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();

  const userPlan = session?.user?.plan || "FREE";
  const currentPlanRank = planRank[userPlan] || 0;
  const userPlanEntry = plans.find((p) => p.id === userPlan) ?? null;
  const availableUpgrades = plans.filter(
    (p) => (planRank[p.id] || 0) > currentPlanRank
  );
  const hasUpgrades = availableUpgrades.length > 0;

  const initialPlanFromUrl = searchParams.get("plan")?.toUpperCase();
  const defaultPlanId =
    (initialPlanFromUrl &&
      availableUpgrades.find((p) => p.id === initialPlanFromUrl)?.id) ||
    availableUpgrades[0]?.id ||
    "BASIC";

  const [selectedPlan, setSelectedPlan] = useState<string>(defaultPlanId);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "stripe">("card");
  const [loading, setLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [bankSubmitted, setBankSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [flashStatus, setFlashStatus] = useState<"success" | "canceled" | null>(null);
  // Feature flags read from /api/settings/public. Default open for PayHere +
  // Bank (fail-open so the page isn't blocked by a transient settings
  // failure); Stripe defaults off so a misconfigured tab doesn't flash up.
  const [payhereEnabled, setPayhereEnabled] = useState(true);
  const [bankEnabled, setBankEnabled] = useState(true);
  const [stripeEnabled, setStripeEnabled] = useState(false);

  // Re-select a valid upgrade target once the session loads. The initial
  // state is seeded before we know the user's plan, so BASIC users landing
  // with a default of BASIC need to be bumped to STANDARD silently.
  useEffect(() => {
    if (!hasUpgrades) return;
    const stillValid = availableUpgrades.find((p) => p.id === selectedPlan);
    if (!stillValid) setSelectedPlan(availableUpgrades[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPlan]);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") setFlashStatus("success");
    if (status === "canceled") setFlashStatus("canceled");
  }, [searchParams]);

  // Refresh the JWT plan once per page load (module-level flag — survives
  // the unmount/remount that update() triggers via the layout's loading
  // state). Extra retries after ?status=success catch a slow webhook.
  useEffect(() => {
    if (checkoutHasRefreshed) return;
    checkoutHasRefreshed = true;
    update().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (flashStatus !== "success") return;
    const timers = [2000, 5000, 10000].map((ms) =>
      window.setTimeout(() => update().catch(() => {}), ms)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashStatus]);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const ph = data.feature_payhere !== "false";
        const bk = data.feature_bank_transfer !== "false";
        const st = data.feature_stripe === "true";
        setPayhereEnabled(ph);
        setBankEnabled(bk);
        setStripeEnabled(st);
        const enabled = { card: ph, stripe: st, bank: bk } as const;
        setPaymentMethod((current) => {
          if (enabled[current]) return current;
          if (ph) return "card";
          if (st) return "stripe";
          if (bk) return "bank";
          return current;
        });
      })
      .catch(() => {});
  }, []);

  const selected = plans.find((p) => p.id === selectedPlan) ?? availableUpgrades[0] ?? plans[0];
  const selectedPayable = upgradePrice(userPlan, selected.id);
  const selectedCredit = (userPlanEntry?.price ?? 0);
  const isUpgradingFromPaid = userPlanEntry !== null && selectedCredit > 0;
  const isActivating = userPlanEntry === null; // FREE user first purchase
  const canCheckout = selectedPayable > 0 && hasUpgrades;

  const handleStripePayment = async () => {
    if (!canCheckout) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        const msg = data.detail
          ? `${data.error || "Failed to start payment"} — ${data.detail}`
          : data.error || "Failed to start payment";
        setError(msg);
        setLoading(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!canCheckout) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/payhere", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl || !data.fields) {
        setError(data.error || "Failed to start payment");
        setLoading(false);
        return;
      }
      const allowedHosts = ["sandbox.payhere.lk", "www.payhere.lk"];
      try {
        const host = new URL(data.checkoutUrl).host;
        if (!allowedHosts.includes(host)) {
          setError("Invalid payment gateway URL");
          setLoading(false);
          return;
        }
      } catch {
        setError("Invalid payment gateway URL");
        setLoading(false);
        return;
      }
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.checkoutUrl;
      for (const [name, value] of Object.entries(data.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value ?? "");
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be less than 5MB");
      return;
    }
    setReceiptName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptFile(reader.result as string);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleBankSubmit = async () => {
    if (!canCheckout) return;
    if (!receiptFile) {
      setError("Please upload a receipt image");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/bank-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, receiptImage: receiptFile, bankReference: bankRef }),
      });
      const data = await res.json();
      if (res.ok) {
        setBankSubmitted(true);
      } else {
        setError(data.error || "Failed to submit receipt");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const payableLabel = `Rs. ${selectedPayable.toLocaleString()}`;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {isActivating ? "Choose your plan" : "Upgrade your plan"}
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          {isActivating
            ? "Pick the plan that fits your wedding and activate it in one click."
            : "Move up a tier — pay only the difference, never the full price again."}
        </p>
      </div>

      {/* Post-redirect flash */}
      {flashStatus === "success" && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Payment received</p>
            <p className="text-xs text-emerald-800 mt-0.5">
              Your plan will upgrade within a few seconds once the payment confirms. Refresh your dashboard if you don&apos;t see it yet.
            </p>
          </div>
        </div>
      )}
      {flashStatus === "canceled" && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Payment canceled</p>
            <p className="text-xs text-amber-800 mt-0.5">
              No charge was made. You can try again or pick a different payment method.
            </p>
          </div>
        </div>
      )}

      {/* Plan Selector */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => {
          const planRankValue = planRank[plan.id] || 0;
          const isCurrent = plan.id === userPlan;
          const isLower = planRankValue < currentPlanRank;
          const isUpgrade = planRankValue > currentPlanRank;
          const isSelected = selectedPlan === plan.id && isUpgrade;
          const payable = upgradePrice(userPlan, plan.id);
          const showMostPopular = plan.id === "STANDARD" && isUpgrade;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => isUpgrade && setSelectedPlan(plan.id)}
              disabled={!isUpgrade}
              className={`relative rounded-2xl p-5 border text-left transition-all ${
                isSelected
                  ? "border-rose-600 bg-white ring-2 ring-rose-600/20 shadow-lg shadow-rose-600/10"
                  : isUpgrade
                  ? "border-gray-200 bg-white hover:border-rose-300 hover:shadow-md cursor-pointer"
                  : isCurrent
                  ? "border-emerald-200 bg-emerald-50/40 cursor-default"
                  : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"
              }`}
            >
              {/* Status pill — mutually exclusive */}
              {isCurrent ? (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  <CheckCircle className="w-3 h-3" /> Current
                </span>
              ) : isLower ? (
                <span className="absolute top-3 right-3 bg-gray-200 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Lower tier
                </span>
              ) : showMostPopular ? (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-md shadow-rose-600/30">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </span>
              ) : null}

              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected
                    ? "bg-rose-100 text-rose-600"
                    : isCurrent
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Crown className="w-5 h-5" />
              </div>

              <p className="font-semibold text-gray-900">{plan.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{plan.tagline}</p>

              {isUpgrade ? (
                <>
                  {isUpgradingFromPaid ? (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400">You pay today</p>
                      <p className="text-2xl font-bold text-gray-900 leading-tight">
                        Rs. {payable.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        <span className="line-through">Rs. {plan.price.toLocaleString()}</span>
                        <span className="ml-1.5 text-emerald-600">
                          − Rs. {(plan.price - payable).toLocaleString()} credit
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-2xl font-bold text-gray-900 leading-tight">
                        Rs. {plan.price.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">one-time</p>
                    </div>
                  )}
                </>
              ) : isCurrent ? (
                <div className="mt-3">
                  <p className="text-sm font-medium text-emerald-700">You&apos;re on this plan</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Paid Rs. {plan.price.toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-500">Included in your plan</p>
                </div>
              )}

              <ul className="mt-4 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-gray-500 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* No upgrades available — PREMIUM user */}
      {!hasUpgrades && (
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Crown className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            You&apos;re on the top plan
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            There&apos;s nothing higher than Premium — you already have everything unlocked.
          </p>
        </div>
      )}

      {/* Upgrade/Order Summary + Payment (only when there's something to pay) */}
      {hasUpgrades && (
        <>
          {/* Summary */}
          <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 sm:p-7 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                {isActivating ? "Order summary" : "Upgrade summary"}
              </h2>
              {isUpgradingFromPaid && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                  <ShieldCheck className="w-3 h-3" /> You only pay the difference
                </span>
              )}
            </div>

            {isUpgradingFromPaid ? (
              <dl className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500">Current plan</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {userPlanEntry?.name}
                    <span className="text-gray-400 font-normal ml-2">
                      (paid Rs. {userPlanEntry?.price.toLocaleString()})
                    </span>
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500">New plan</dt>
                  <dd className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" /> {selected.name}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500">Plan price</dt>
                  <dd className="text-sm text-gray-700">Rs. {selected.price.toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500">
                    Credit from your {titleCase(userPlan)} plan
                  </dt>
                  <dd className="text-sm text-emerald-700">
                    − Rs. {selectedCredit.toLocaleString()}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-4">
                  <dt className="text-base font-semibold text-gray-900">You pay today</dt>
                  <dd className="text-2xl font-bold text-gray-900">{payableLabel}</dd>
                </div>
              </dl>
            ) : (
              <dl className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500">Plan</dt>
                  <dd className="text-sm font-medium text-gray-900">{selected.name}</dd>
                </div>
                <div className="flex items-center justify-between py-4">
                  <dt className="text-base font-semibold text-gray-900">Total</dt>
                  <dd className="text-2xl font-bold text-gray-900">{payableLabel}</dd>
                </div>
              </dl>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {!payhereEnabled && !bankEnabled && !stripeEnabled ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Payments are temporarily paused
                </h3>
                <p className="text-sm text-gray-500">
                  We&apos;re not taking new payments right now. Please try again shortly or contact support.
                </p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                  {payhereEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                        paymentMethod === "card"
                          ? "text-rose-600 border-b-2 border-rose-600 bg-rose-50/40"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" /> Card (LKR)
                    </button>
                  )}
                  {stripeEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("stripe")}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                        paymentMethod === "stripe"
                          ? "text-rose-600 border-b-2 border-rose-600 bg-rose-50/40"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Globe className="w-4 h-4" /> International Card
                    </button>
                  )}
                  {bankEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank")}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                        paymentMethod === "bank"
                          ? "text-rose-600 border-b-2 border-rose-600 bg-rose-50/40"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Building2 className="w-4 h-4" /> Bank Transfer
                    </button>
                  )}
                </div>

                <div className="p-6 sm:p-8">
                  {error && (
                    <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 border border-red-100">
                      {error}
                    </div>
                  )}

                  {paymentMethod === "card" ? (
                    <div className="space-y-5">
                      <p className="text-xs text-gray-500">
                        Secure LKR card payment via PayHere. Supports Visa, Mastercard, and local debit cards.
                      </p>
                      <button
                        type="button"
                        onClick={handleCardPayment}
                        disabled={loading || !canCheckout}
                        className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-semibold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to payment…
                          </>
                        ) : isActivating ? (
                          <>
                            <CreditCard className="w-4 h-4" /> Activate {selected.name} — {payableLabel}
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" /> Pay {payableLabel} &amp; upgrade
                          </>
                        )}
                      </button>
                    </div>
                  ) : paymentMethod === "stripe" ? (
                    <div className="space-y-5">
                      <p className="text-xs text-gray-500">
                        Secure international card payment via Stripe. Accepts Visa, Mastercard, and Amex.
                      </p>
                      <button
                        type="button"
                        onClick={handleStripePayment}
                        disabled={loading || !canCheckout}
                        className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Stripe…
                          </>
                        ) : isActivating ? (
                          <>
                            <Globe className="w-4 h-4" /> Continue to Stripe — {payableLabel}
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4" /> Pay {payableLabel} &amp; upgrade
                          </>
                        )}
                      </button>
                    </div>
                  ) : bankSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Receipt submitted
                      </h3>
                      <p className="text-sm text-gray-500">
                        We&apos;ll review your payment within 24 hours and activate your plan.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Bank Details */}
                      <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-100">
                        <p className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <Building2 className="w-4 h-4" /> Bank details
                        </p>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-blue-700/80">Bank</dt>
                            <dd className="font-medium text-blue-900">Bank of Ceylon</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-blue-700/80">Account name</dt>
                            <dd className="font-medium text-blue-900">INVITATION.LK (PVT) LTD</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-blue-700/80">Account number</dt>
                            <dd className="font-medium text-blue-900">85XXXXXXXX</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-blue-700/80">Branch</dt>
                            <dd className="font-medium text-blue-900">Colombo Main</dd>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-blue-100 mt-2">
                            <dt className="text-blue-700/80">Amount to transfer</dt>
                            <dd className="font-semibold text-blue-900">{payableLabel}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Receipt Upload */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                          Receipt image
                        </label>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-colors">
                          <Upload className="w-8 h-8 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">
                            {receiptName || "Click to upload receipt"}
                          </p>
                          <p className="text-xs text-gray-300 mt-1">PNG or JPG, up to 5MB</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Bank Reference */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                          Bank reference (optional)
                        </label>
                        <input
                          type="text"
                          value={bankRef}
                          onChange={(e) => setBankRef(e.target.value)}
                          placeholder="e.g. transaction ID or reference number"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleBankSubmit}
                        disabled={loading || !receiptFile || !canCheckout}
                        className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-semibold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> Submit receipt — {payableLabel}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
