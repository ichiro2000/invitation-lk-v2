"use client";

import { useState, useEffect } from "react";
import { Heart, Menu, X, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import DevNoticeBanner from "./DevNoticeBanner";

const links = [
  { href: "/features", label: "Features" },
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <DevNoticeBanner />
      <nav
        className={`transition-all duration-300 ease-out ${
          scrolled ? "glass border-b border-slate-200/50 shadow-sm py-3" : "bg-transparent py-5"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="INVITATION.LK Home">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              INVITATION<span className="text-rose-600">.LK</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-[0.8125rem] font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-rose-600 bg-rose-50"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary text-[0.8125rem] py-2.5 px-5 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-[0.8125rem] font-medium text-slate-500 hover:text-slate-900 rounded-lg transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link href="/onboard" className="btn-primary text-[0.8125rem] py-2.5 px-5">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 -mr-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-4 mt-3 glass rounded-2xl border border-slate-200/50 shadow-lg p-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2.5 px-4 text-sm font-medium rounded-xl transition-colors ${
                  isActive ? "text-rose-600 bg-rose-50" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="border-t border-slate-100 mt-2 pt-2">
            {isLoggedIn ? (
              <Link href="/dashboard" className="block mt-1 btn-primary w-full text-center flex items-center justify-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="block py-2.5 px-4 text-sm font-medium text-slate-500 rounded-xl hover:bg-slate-50">
                  Sign In
                </Link>
                <Link href="/onboard" className="block mt-1 btn-primary w-full text-center">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      </nav>
    </div>
  );
}
