"use client";

import Link from "next/link";
import { XCircle, ArrowRight, ArrowLeft } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-10 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
        <p className="text-sm text-gray-400 mb-8">
          Your payment was not processed. No charges were made.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/checkout"
            className="inline-flex items-center justify-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20"
          >
            Try Again <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
