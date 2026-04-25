"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, Pencil, Users, UserPlus, ListTodo, DollarSign, Store, LogOut, CreditCard, ShieldCheck, FileText, LayoutGrid, Mail, Loader2, Check, LifeBuoy, Eye } from "lucide-react";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import NotificationsBell from "@/components/dashboard/NotificationsBell";

// Module-level guard — survives re-mount cycles triggered by update().
let bannerHasRefreshed = false;
// Once we've seen an authenticated session, keep rendering the layout chrome
// even while a subsequent update() call re-fetches the session. Otherwise
// every update() call would unmount children (because NextAuth flips status
// back to "loading" during the refetch) and anything on the child page that
// then re-fires update() — e.g. a timed retry — would loop.
let dashboardHasAuthenticatedOnce = false;

interface NotificationItem {
  id: string;
  kind: "support.pending";
  subject: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  updatedAt: string;
  href: string;
}

interface SidebarInfo {
  weddingDate: string;
  venue: string;
  slug: string;
  isPublished: boolean;
  daysUntil: number;
}

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
  const [sidebarInfo, setSidebarInfo] = useState<SidebarInfo | null>(null);

  // Fetch the sidebar countdown once per authenticated user. Depend on the
  // *id* string, not the session object — useSession returns a new object
  // reference on every NextAuth poll/refetch, which would otherwise re-fire
  // this fetch every few minutes for no benefit.
  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) return;
    const ctrl = new AbortController();
    fetch("/api/dashboard/sidebar", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.invitation) setSidebarInfo(d.invitation); })
      .catch(() => {}); // Aborted or network blip — keep last good value.
    return () => ctrl.abort();
  }, [userId]);

  if (session) dashboardHasAuthenticatedOnce = true;

  // Only show the blocking spinner on the *first* load. Subsequent
  // "loading" states are background refetches triggered by update(); keep
  // the last-rendered session data visible so children don't unmount and
  // loop back into update().
  if (status === "loading" && !dashboardHasAuthenticatedOnce) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (status === "unauthenticated") redirect("/login");
  if (!session) {
    // In-flight update() — session is null transiently but we already
    // authenticated once. Render nothing (no spinner, no unmount); the
    // next render after the refetch will have the fresh session.
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-30 hidden lg:flex">
        <div className="px-6 pt-6 pb-4">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
            <span className="text-lg font-bold text-gray-900">INVITATION<span className="text-rose-600">.LK</span></span>
          </Link>
        </div>

        {/* Countdown card — top of sidebar (mirrors reference IA). */}
        {sidebarInfo && (
          <div className="mx-4 mb-4 rounded-2xl bg-rose-50 px-4 py-3 flex items-center gap-3">
            <span className="text-3xl font-bold text-rose-700 tabular-nums leading-none">
              {sidebarInfo.daysUntil >= 0 ? sidebarInfo.daysUntil : 0}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-rose-500 font-semibold">
                {sidebarInfo.daysUntil >= 0 ? "Days until" : "Wedding day"}
              </p>
              <p className="text-xs text-gray-700 leading-tight mt-0.5 truncate">
                {formatWeddingDate(sidebarInfo.weddingDate)}
                {sidebarInfo.venue ? ` · ${sidebarInfo.venue}` : ""}
              </p>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
          {sidebarLinks.slice(6).map((link) => (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === link.href ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50 hover:text-rose-600"}`}>
              <link.icon className="w-4 h-4" /> {link.label}
            </Link>
          ))}

          {/* Help */}
          <p className="text-[10px] text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">Help</p>
          <Link href="/dashboard/support" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/dashboard/support") ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50 hover:text-rose-600"}`}>
            <LifeBuoy className="w-4 h-4" /> Support
          </Link>

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
              <Link href="/admin/orders" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === "/admin/orders" ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50 hover:text-rose-600"}`}>
                <ShieldCheck className="w-4 h-4" /> Orders
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${pathname === "/dashboard/profile" ? "bg-rose-50" : "hover:bg-gray-50"}`}
          >
            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-sm font-bold">
              {(session.user?.name ?? "").trim().charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.user?.plan === "FREE" ? "Free Plan" : `${session.user?.plan} Plan`}</p>
            </div>
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 w-full px-4 py-2 mt-2 text-sm text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        <ImpersonationBanner />
        <DashboardHeader sidebarInfo={sidebarInfo} />
        <div className="px-6 sm:px-8 pb-8 max-w-7xl mx-auto">
          {!session.user?.emailVerified && <VerifyEmailBanner />}
          {children}
        </div>
      </main>
    </div>
  );
}

// Render an ISO date as "Aug 30, 2026" (the format used in the reference
// countdown card). UTC-anchored so a wedding stored as 2026-08-30 stays on
// Aug 30 regardless of viewer timezone.
function formatWeddingDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function DashboardHeader({ sidebarInfo }: { sidebarInfo: SidebarInfo | null }) {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (!alive) return;
        setCount(data.count ?? 0);
        setItems(data.items ?? []);
      } catch { /* keep last good value */ }
    };
    load();
    // Refresh every 60s so a customer sees a fresh admin reply without a hard
    // reload. No cleanup on visibility change — Next's router unmounts the
    // layout on hard nav, and a browser tab backgrounded for hours will just
    // catch up on focus.
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-end gap-3">
        {sidebarInfo?.isPublished && (
          <Link
            href={`/i/${sidebarInfo.slug}`}
            target="_blank"
            rel="noopener"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-rose-200 hover:text-rose-600 text-sm font-medium text-gray-600 transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview invitation
          </Link>
        )}
        <NotificationsBell count={count} items={items} />
      </div>
    </header>
  );
}

function VerifyEmailBanner() {
  const { update } = useSession();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  // If the user verified in another tab, refresh the JWT once per page load so
  // this banner unmounts. A module-level flag (not useRef) is required because
  // calling update() flips session status to "loading" → layout unmounts us →
  // we remount with a fresh ref and would loop forever.
  useEffect(() => {
    if (bannerHasRefreshed) return;
    bannerHasRefreshed = true;
    update().catch(() => {});
  }, [update]);

  const resend = async () => {
    setState("sending");
    setMsg(null);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMsg(data.error || "Failed to send verification email");
        return;
      }
      setState("sent");
      setMsg(data.alreadyVerified ? "Your email is already verified." : "Verification email sent — check your inbox.");
    } catch {
      setState("error");
      setMsg("Network error — please try again");
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-900">Please verify your email address</p>
        <p className="text-xs text-amber-700 mt-0.5">
          {msg || "We sent a verification link when you signed up. Click it to confirm your email."}
        </p>
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={state === "sending" || state === "sent"}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
      >
        {state === "sending" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {state === "sent" && <Check className="w-3.5 h-3.5" />}
        {state === "sending" ? "Sending…" : state === "sent" ? "Sent" : "Resend email"}
      </button>
    </div>
  );
}
