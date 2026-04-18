"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, Pencil, Users, UserPlus, ListTodo, DollarSign, Store, LogOut, CreditCard, ShieldCheck, FileText, LayoutGrid } from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/invitations", label: "My Invitations", icon: FileText },
  { href: "/dashboard/editor", label: "Edit Invitation", icon: Pencil },
  { href: "/dashboard/guests", label: "Add Guests", icon: UserPlus },
  { href: "/dashboard/guests/links", label: "Guest List & Links", icon: Users },
  { href: "/dashboard/guests/tables", label: "Table Arrangement", icon: LayoutGrid },
  { href: "/dashboard/tools/tasks", label: "Task Checklist", icon: ListTodo },
  { href: "/dashboard/tools/budget", label: "Budget Management", icon: DollarSign },
  { href: "/dashboard/tools/vendors", label: "Vendor List", icon: Store },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-30 hidden lg:flex">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
            <span className="text-lg font-bold text-gray-900">INVITATION<span className="text-rose-600">.LK</span></span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Invitation */}
          <p className="text-[10px] text-gray-400 uppercase tracking-wider px-4 pt-2 pb-1">Invitation</p>
          {sidebarLinks.slice(0, 3).map((link) => (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === link.href ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50 hover:text-rose-600"}`}>
              <link.icon className="w-4 h-4" /> {link.label}
            </Link>
          ))}

          {/* Guest Management */}
          <p className="text-[10px] text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">Guest Management</p>
          {sidebarLinks.slice(3, 6).map((link) => (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === link.href ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50 hover:text-rose-600"}`}>
              <link.icon className="w-4 h-4" /> {link.label}
            </Link>
          ))}

          {/* Wedding Tools */}
          <p className="text-[10px] text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">Wedding Plan Tools</p>
          {sidebarLinks.slice(6).map((link) => {
            const planRequired = true; // Standard+ only
            const userPlan = session.user?.plan;
            const hasAccess = userPlan === "STANDARD" || userPlan === "PREMIUM" || userPlan === "ADMIN";
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === link.href ? "bg-rose-50 text-rose-600" : hasAccess ? "text-gray-600 hover:bg-gray-50 hover:text-rose-600" : "text-gray-300 cursor-not-allowed"}`}>
                <link.icon className="w-4 h-4" /> {link.label}
                {!hasAccess && <span className="ml-auto text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Standard+</span>}
              </Link>
            );
          })}

          {/* Billing */}
          {session.user?.plan === "FREE" && (
            <>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">Billing</p>
              <Link href="/dashboard/checkout" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === "/dashboard/checkout" ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50 hover:text-rose-600"}`}>
                <CreditCard className="w-4 h-4" /> Upgrade Plan
              </Link>
            </>
          )}

          {/* Admin */}
          {session.user?.role === "ADMIN" && (
            <>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">Admin</p>
              <Link href="/admin/bank-transfers" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === "/admin/bank-transfers" ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50 hover:text-rose-600"}`}>
                <ShieldCheck className="w-4 h-4" /> Bank Transfers
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-sm font-bold">
              {session.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.user?.plan === "FREE" ? "Free Plan" : `${session.user?.plan} Plan`}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 w-full px-4 py-2 mt-2 text-sm text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        <div className="p-6 sm:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
