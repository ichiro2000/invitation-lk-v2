"use client";

import { useState, useEffect } from "react";
import { Heart, Menu, X } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/features", label: "Features" },
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass border-b border-white/20 shadow-lg shadow-black/5 py-2" : "bg-transparent py-4"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="w-7 h-7 text-rose-600 fill-rose-600 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-gray-900">INVITATION<span className="text-rose-600">.LK</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors group">
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-rose-600 rounded-full group-hover:w-6 transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors">
              Sign In
            </Link>
            <Link href="/onboard" className="bg-rose-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 hover:shadow-xl hover:shadow-rose-600/30 hover:-translate-y-0.5">
              Get Started Free
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/20 mt-2 mx-4 rounded-2xl p-4 shadow-xl">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-gray-700 font-medium rounded-xl hover:bg-rose-50">{link.label}</Link>
          ))}
          <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-gray-700 font-medium rounded-xl hover:bg-rose-50">Sign In</Link>
          <Link href="/onboard" onClick={() => setMobileOpen(false)} className="block bg-rose-600 text-white py-3 px-4 rounded-xl text-center font-medium mt-2">Get Started Free</Link>
        </div>
      )}
    </nav>
  );
}
