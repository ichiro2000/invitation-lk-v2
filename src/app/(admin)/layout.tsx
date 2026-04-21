"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart, LayoutDashboard, Users, FileText,
  Palette, LogOut, ShieldCheck,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/templates", label: "Templates", icon: Palette },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-30 hidden lg:flex">
        <div className="p-6 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
            <span className="text-lg font-bold text-gray-900">
              INVITATION<span className="text-rose-600">.LK</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider px-4 pt-2 pb-1">Management</p>
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-rose-50 text-rose-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-rose-600"
              }`}
            >
              <link.icon className="w-4 h-4" /> {link.label}
            </Link>
          ))}

          <div className="pt-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider px-4 pt-2 pb-1">Quick Links</p>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-rose-600 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" /> User Dashboard
            </Link>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-sm font-bold">
              {session.user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name || "Admin"}</p>
              <p className="text-xs text-gray-400 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 w-full px-4 py-2 mt-2 text-sm text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <span className="font-bold text-gray-900">Admin</span>
          </div>
        </div>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
