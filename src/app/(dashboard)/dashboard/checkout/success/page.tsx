"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { update } = useSession();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState("");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid session. No payment session found.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/checkout/verify?session_id=${sessionId}`);
        const data = await res.json();
        if (res.ok) {
          setPlan(data.plan);
          setAmount(data.amount);
          await update();
        } else {
          setError(data.error || "Failed to verify payment");
        }
      } catch {
        setError("Something went wrong verifying your payment.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [sessionId, update]);

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
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-400 text-sm mb-6">Your plan has been upgraded successfully.</p>
            <div className="bg-gray-50 rounded-2xl p-5 mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-sm font-semibold text-gray-900">{plan}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="text-lg font-bold text-gray-900">Rs. {amount?.toLocaleString()}</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
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
