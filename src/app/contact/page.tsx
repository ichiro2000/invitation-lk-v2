"use client";

import { motion } from "framer-motion";
import { MessageCircle, Phone, Mail, Send, ArrowRight, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <section className="py-28 bg-gradient-to-b from-rose-50/50 to-white relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-100/20 rounded-full blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block bg-rose-100 text-rose-700 px-5 py-1.5 rounded-full text-sm font-medium mb-6">Contact Us</motion.span>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">Get in Touch</motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-gray-500 max-w-xl mx-auto text-lg">Have questions? We&apos;d love to hear from you. Reach out via WhatsApp for the fastest response.</motion.p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
              {/* Contact Info */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                {/* WhatsApp */}
                <a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-green-500 text-white p-5 rounded-2xl mb-6 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 group">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><MessageCircle className="w-6 h-6" /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">Chat on WhatsApp</p>
                    <p className="text-green-100 text-sm">Fastest way to reach us</p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>

                {/* Other contacts */}
                <div className="space-y-4">
                  {[
                    { icon: Phone, label: "Phone", value: "+94 77 123 4567" },
                    { icon: Mail, label: "Email", value: "hello@invitation.lk" },
                    { icon: MapPin, label: "Location", value: "Colombo, Sri Lanka" },
                    { icon: Clock, label: "Hours", value: "Mon - Sat, 9 AM - 6 PM" },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 hover:border-rose-200 hover:shadow-md transition-all">
                      <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center"><item.icon className="w-5 h-5 text-rose-500" /></div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</p>
                        <p className="text-gray-800 font-medium">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <form className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50 border border-gray-100 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Your Name</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
                      <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm" placeholder="you@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Phone</label>
                    <input type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm" placeholder="077 123 4567" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Message</label>
                    <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm resize-none" placeholder="Tell us about your wedding..." />
                  </div>
                  <button type="submit" className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors">
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
