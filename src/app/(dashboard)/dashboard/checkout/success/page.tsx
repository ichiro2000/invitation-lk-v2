"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";

// No useSession / update() here. Calling update() on this page causes the
// parent dashboard layout to flip into its session-loading branch, which
// unmounts us mid-fetch; we then remount, retry, and the page sticks on
// "Verifying your payment...". The user's plan is already correct in the
// DB — the sidebar will pick it up on the next navigation.

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState("");
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState("");
  // True once we've run out of polling attempts — used to soften the copy
  // so the user doesn't sit on "Payment Pending" indefinitely thinking the
  // page will keep updating.
  const [pollExhausted, setPollExhausted] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("Invalid session. No payment reference found.");
      setLoading(false);
      return;
    }

    const query = `order_id=${orderId}`;
    let cancelled = false;

    const verifyOnce = async (): Promise<string | null> => {
      try {
        const res = await fetch(`/api/checkout/verify?${query}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return null;
        if (res.ok) {
          setPlan(data.plan);
          setAmount(data.amount);
          setStatus(data.status);
          return data.status as string;
        }
        setError(data.error || "Failed to verify payment");
        return null;
      } catch {
        if (!cancelled) setError("Something went wrong verifying your payment.");
        return null;
      }
    };

    (async () => {
      // Poll up to ~30s while status is PENDING so the webhook has time to
      // land and flip us to COMPLETED. Once status is non-PENDING we stop.
      for (let attempt = 0; attempt < 15; attempt++) {
        if (cancelled) return;
        const s = await verifyOnce();
        if (cancelled) return;
        setLoading(false);
        if (!s || s !== "PENDING") return;
        await new Promise((r) => setTimeout(r, 2000));
      }
      // Ran out of attempts without the webhook flipping us to COMPLETED.
      // Don't mislead the user that this page will keep updating.
      if (!cancelled) setPollExhausted(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const isPending = status === "PENDING";
  const isFailed = status === "FAILED";

  return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-10 text-center">
        {loading ? (
          <div className="py-12">
            <Loader2 className="w-12 h-12 text-rose-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Verifying your payment...</p>
          </div>
        ) : error ? (
          <div className="py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-sm text-gray-400 mb-6">{error}</p>
            <Link
              href="/dashboard/checkout"
              className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
            >
              Try Again <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="py-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPending ? "bg-amber-100" : isFailed ? "bg-red-100" : "bg-green-100"}`}>
              {isPending ? (
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
              ) : isFailed ? (
                <span className="text-3xl text-red-600">!</span>
              ) : (
                <CheckCircle className="w-10 h-10 text-green-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isPending
                ? pollExhausted
                  ? "We're confirming your payment"
                  : "Payment Pending"
                : isFailed
                ? "Payment Failed"
                : "Payment Successful!"}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {isPending
                ? pollExhausted
                  ? "Your payment was received — the bank just hasn't confirmed it yet. This usually lands within a minute. You can safely leave this page; your plan will activate automatically and your dashboard will reflect it on next load."
                  : "We're still confirming your payment with the bank. This page will update shortly."
                : isFailed
                ? "The payment did not go through. Please try again."
                : "Your plan has been upgraded successfully. Open your dashboard to see your new plan."}
            </p>
            <div className="bg-gray-50 rounded-2xl p-5 mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-sm font-semibold text-gray-900">{plan}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{isFailed ? "Amount" : "Amount Paid"}</p>
                <p className="text-lg font-bold text-gray-900">Rs. {amount?.toLocaleString()}</p>
              </div>
            </div>
            <Link
              href={isFailed ? "/dashboard/checkout" : "/dashboard"}
              className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
            >
              {isFailed ? "Try Again" : "Go to Dashboard"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
