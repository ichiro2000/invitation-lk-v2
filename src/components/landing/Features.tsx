"use client";

import { motion } from "framer-motion";
import { Globe, UserCheck, Calendar, Clock, MapPin, MessageCircle, QrCode, Heart, Users, Smartphone, FileText, Shield } from "lucide-react";

const features = [
  { icon: Globe, title: "Custom Wedding Website", desc: "A personalized website with your love story and wedding details.", bg: "bg-rose-50", iconColor: "text-rose-500" },
  { icon: UserCheck, title: "RSVP Management", desc: "Collect RSVPs online with meal preferences and guest count.", bg: "bg-violet-50", iconColor: "text-violet-500" },
  { icon: Calendar, title: "Event Schedule", desc: "Timeline for all ceremonies — Poruwa, Church, Reception.", bg: "bg-amber-50", iconColor: "text-amber-500" },
  { icon: Clock, title: "Countdown Timer", desc: "Build excitement with a beautiful countdown to your big day.", bg: "bg-teal-50", iconColor: "text-teal-500" },
  { icon: MapPin, title: "Google Maps", desc: "Integrated venue map so guests never get lost.", bg: "bg-blue-50", iconColor: "text-blue-500" },
  { icon: MessageCircle, title: "WhatsApp Sharing", desc: "Share your invitation instantly via WhatsApp or SMS.", bg: "bg-green-50", iconColor: "text-green-500" },
  { icon: QrCode, title: "QR Code", desc: "Print a QR code on physical cards linking to your digital invite.", bg: "bg-indigo-50", iconColor: "text-indigo-500" },
  { icon: Heart, title: "Personalized Invites", desc: "Each guest gets a unique link with their name on the invitation.", bg: "bg-pink-50", iconColor: "text-pink-500" },
  { icon: Users, title: "Guest Management", desc: "Track your guest list, groups, and attendance in one place.", bg: "bg-orange-50", iconColor: "text-orange-500" },
  { icon: Smartphone, title: "Mobile Responsive", desc: "Looks perfect on every device — phone, tablet, or desktop.", bg: "bg-cyan-50", iconColor: "text-cyan-500" },
  { icon: FileText, title: "Wedding Planning Tools", desc: "Task checklist, budget tracker, and vendor management.", bg: "bg-fuchsia-50", iconColor: "text-fuchsia-500" },
  { icon: Shield, title: "Add to Calendar", desc: "Guests can add your wedding to their phone calendar instantly.", bg: "bg-red-50", iconColor: "text-red-500" },
];

export default function Features() {
  return (
    <section id="features" className="py-28 bg-white relative overflow-hidden">
      <div className="absolute top-20 right-0 w-96 h-96 bg-rose-50 rounded-full blur-3xl opacity-50" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="inline-block bg-rose-100 text-rose-700 px-5 py-1.5 rounded-full text-sm font-medium mb-6">Features</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5">Everything You Need</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-500 max-w-2xl mx-auto text-lg">All the tools to create, share, and manage your wedding invitation.</motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} whileHover={{ y: -6 }} className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl hover:shadow-rose-100/50 transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/0 to-rose-50/0 group-hover:from-rose-50/50 group-hover:to-amber-50/30 transition-all duration-500" />
              <div className="relative z-10">
                <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
