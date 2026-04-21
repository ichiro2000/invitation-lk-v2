"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SuspendedActions() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-700 text-sm font-medium transition-colors"
    >
      <LogOut className="w-4 h-4" /> Sign out
    </button>
  );
}
