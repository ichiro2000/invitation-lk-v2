"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
              <span className="text-xl font-bold text-white">INVITATION<span className="text-rose-500">.LK</span></span>
            </Link>
            <p className="text-gray-500 max-w-sm leading-relaxed mb-6 text-sm">Beautiful digital wedding invitations crafted for Sri Lankan celebrations.</p>
            <div className="flex gap-3">
              {["F", "I", "T"].map((s) => (
                <a key={s} href="#" className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-gray-500 hover:bg-rose-600 hover:text-white transition-all text-sm font-medium">{s}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {[{ href: "/templates", label: "Templates" }, { href: "#features", label: "Features" }, { href: "#pricing", label: "Pricing" }, { href: "#faq", label: "FAQ" }].map((l) => (
                <li key={l.href}><a href={l.href} className="text-gray-500 hover:text-rose-400 transition-colors text-sm">{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-gray-500 hover:text-rose-400 transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-500 hover:text-rose-400 transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/return" className="text-gray-500 hover:text-rose-400 transition-colors text-sm">Return &amp; Refund</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800/50 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} INVITATION.LK. All rights reserved.</p>
          <p className="text-sm text-gray-600 flex items-center gap-1.5">Made with love in Sri Lanka <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /></p>
        </div>
      </div>
    </footer>
  );
}
