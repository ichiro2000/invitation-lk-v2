import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Mail } from "lucide-react";
import RefreshSessionOnSuccess from "./refresh-session";

export const metadata: Metadata = {
  title: "Verify Email | INVITATION.LK",
  robots: { index: false, follow: false },
};

type Status = "success" | "expired" | "invalid" | "error" | "pending";

const COPY: Record<Status, { icon: typeof CheckCircle2; color: string; title: string; body: string; cta?: { href: string; label: string } }> = {
  success: {
    icon: CheckCircle2,
    color: "text-emerald-600 bg-emerald-50",
    title: "Email verified",
    body: "Your email address has been confirmed. You can now use the full INVITATION.LK experience.",
    cta: { href: "/dashboard", label: "Go to Dashboard" },
  },
  expired: {
    icon: Clock,
    color: "text-amber-600 bg-amber-50",
    title: "This link has expired",
    body: "Verification links are valid for 24 hours. Request a new one from your dashboard.",
    cta: { href: "/dashboard", label: "Go to Dashboard" },
  },
  invalid: {
    icon: XCircle,
    color: "text-rose-600 bg-rose-50",
    title: "This link isn't valid",
    body: "The verification link may have already been used or is incorrect. Request a fresh link from your dashboard.",
    cta: { href: "/dashboard", label: "Go to Dashboard" },
  },
  error: {
    icon: XCircle,
    color: "text-rose-600 bg-rose-50",
    title: "Something went wrong",
    body: "We couldn't verify your email right now. Please try again in a moment.",
    cta: { href: "/dashboard", label: "Go to Dashboard" },
  },
  pending: {
    icon: Mail,
    color: "text-rose-600 bg-rose-50",
    title: "Check your inbox",
    body: "We've sent a verification link to your email. Click the link in the email to finish verifying your account.",
    cta: { href: "/dashboard", label: "Go to Dashboard" },
  },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const key = (["success", "expired", "invalid", "error"].includes(status || "")
    ? (status as Status)
    : "pending") as Status;
  const { icon: Icon, color, title, body, cta } = COPY[key];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16">
      {key === "success" && <RefreshSessionOnSuccess />}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-5`}>
          <Icon className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-7">{body}</p>
        {cta && (
          <Link
            href={cta.href}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </main>
  );
}
