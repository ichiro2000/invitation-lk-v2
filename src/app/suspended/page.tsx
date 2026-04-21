import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import SuspendedActions from "./actions";
import { Ban } from "lucide-react";

export default async function SuspendedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { suspendedAt: true, suspendedReason: true, email: true },
  });

  // If the account is no longer suspended, bounce them back to normal flow.
  if (!user?.suspendedAt) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Ban className="w-7 h-7 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Account suspended</h1>
        <p className="text-sm text-gray-500 mt-2">
          Your INVITATION.LK account has been temporarily suspended. Please contact support if you think this is a mistake.
        </p>

        {user.suspendedReason && (
          <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Reason</p>
            <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{user.suspendedReason}</p>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-400">
          Signed in as <span className="font-mono">{user.email}</span> ·
          suspended since {new Date(user.suspendedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <a
            href="mailto:hello@invitation.lk"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
          >
            Contact support
          </a>
          <SuspendedActions />
        </div>
      </div>
    </div>
  );
}
