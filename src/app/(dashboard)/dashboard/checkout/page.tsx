"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Building2, Upload, CheckCircle, Loader2, Crown } from "lucide-react";

const plans = [
  { id: "BASIC", name: "Basic", price: 2500, features: ["1 Template", "Up to 100 Guests", "Digital Invitation"] },
  { id: "STANDARD", name: "Standard", price: 5000, features: ["All Templates", "Up to 500 Guests", "Wedding Tools"] },
  { id: "PREMIUM", name: "Premium", price: 10000, features: ["All Templates", "Unlimited Guests", "Priority Support"] },
];

const planRank: Record<string, number> = { FREE: 0, BASIC: 1, STANDARD: 2, PREMIUM: 3, ADMIN: 4 };

function CheckoutContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan")?.toUpperCase() || "BASIC";

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card");
  const [loading, setLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [bankSubmitted, setBankSubmitted] = useState(false);
  const [error, setError] = useState("");

  const userPlan = session?.user?.plan || "FREE";
  const currentPlanRank = planRank[userPlan] || 0;
  const selected = plans.find((p) => p.id === selectedPlan) || plans[0];

  const handleCardPayment = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session");
        setLoading(false);
      }
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h1>
        <p className="text-gray-400 mt-1">Choose a plan and complete your payment.</p>
      </div>

      {/* Plan Selector */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => {
          const isCurrentOrHigher = currentPlanRank >= (planRank[plan.id] || 0);
          const isSelected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => !isCurrentOrHigher && setSelectedPlan(plan.id)}
              disabled={isCurrentOrHigher}
              className={`relative rounded-2xl p-5 border-2 text-left transition-all ${
                isSelected && !isCurrentOrHigher
                  ? "border-rose-600 bg-rose-50/50 shadow-lg shadow-rose-600/10"
                  : isCurrentOrHigher
                  ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                  : "border-gray-200 bg-white hover:border-rose-300 hover:shadow-md"
              }`}
            >
              {isCurrentOrHigher && (
                <span className="absolute top-3 right-3 bg-gray-200 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                  Current Plan
                </span>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isSelected && !isCurrentOrHigher ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-400"}`}>
                <Crown className="w-5 h-5" />
              </div>
              <p className="font-semibold text-gray-900">{plan.name}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                Rs. {plan.price.toLocaleString()}
              </p>
              <ul className="mt-3 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-gray-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-green-400" /> {f}
                  </li>
                ))}
              </ul>
              {isSelected && !isCurrentOrHigher && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setPaymentMethod("card")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              paymentMethod === "card" ? "text-rose-600 border-b-2 border-rose-600 bg-rose-50/30" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Pay with Card
          </button>
          <button
            onClick={() => setPaymentMethod("bank")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              paymentMethod === "bank" ? "text-rose-600 border-b-2 border-rose-600 bg-rose-50/30" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Building2 className="w-4 h-4" /> Bank Transfer
          </button>
        </div>

        <div className="p-8">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}

          {paymentMethod === "card" ? (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Selected Plan</p>
                  <p className="text-sm font-semibold text-gray-900">{selected.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-lg font-bold text-gray-900">Rs. {selected.price.toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={handleCardPayment}
                disabled={loading || currentPlanRank >= (planRank[selectedPlan] || 0)}
                className="w-full bg-rose-600 text-white py-3 rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to payment...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Pay Now</>
                )}
              </button>
            </div>
          ) : bankSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Receipt Submitted!</h3>
              <p className="text-sm text-gray-400">We&apos;ll review your payment within 24 hours and activate your plan.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bank Details */}
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                <p className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Bank Details
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Bank</span>
                    <span className="font-medium text-blue-900">Bank of Ceylon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Account Name</span>
                    <span className="font-medium text-blue-900">INVITATION.LK (PVT) LTD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Account Number</span>
                    <span className="font-medium text-blue-900">85XXXXXXXX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Branch</span>
                    <span className="font-medium text-blue-900">Colombo Main Branch</span>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Amount to Transfer</p>
                  <p className="text-lg font-bold text-gray-900">Rs. {selected.price.toLocaleString()}</p>
                </div>
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Receipt Image</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-colors">
                  <Upload className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">{receiptName || "Click to upload receipt"}</p>
                  <p className="text-xs text-gray-300 mt-1">PNG, JPG up to 5MB</p>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Bank Reference */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Bank Reference (Optional)</label>
                <input
                  type="text"
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                  placeholder="e.g. Transaction ID or reference number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
                />
              </div>

              <button
                onClick={handleBankSubmit}
                disabled={loading || !receiptFile || currentPlanRank >= (planRank[selectedPlan] || 0)}
                className="w-full bg-rose-600 text-white py-3 rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Submit Receipt</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
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
