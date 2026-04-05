"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, ArrowLeft, User, Calendar as CalendarIcon, MapPin, Mail, Phone, Lock, Eye, EyeOff, Loader2, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export default function OnboardPage() {
  const [step, setStep] = useState(1);
  const [yourName, setYourName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [weddingDate, setWeddingDate] = useState<Date | undefined>(undefined);
  const [venue, setVenue] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canGoNext = () => {
    if (step === 1) return yourName.trim() && partnerName.trim();
    if (step === 2) return !!weddingDate && venue.trim();
    if (step === 3) return email && phone && password.length >= 8;
    return false;
  };

  const handleSubmit = async () => {
    if (!canGoNext()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yourName,
          partnerName,
          weddingDate: weddingDate ? weddingDate.toISOString().split("T")[0] : "",
          venue,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Redirect to dashboard
      window.location.href = "/login?registered=true";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-600 fill-rose-600" />
          <span className="text-2xl font-bold text-gray-900">INVITATION<span className="text-rose-600">.LK</span></span>
        </Link>
        <p className="text-gray-400 mt-2">Let&apos;s create your wedding invitation</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step > s ? "bg-green-500 text-white" : step === s ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30" : "bg-gray-100 text-gray-400"
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-green-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider mb-6 px-2">
        <span className={step === 1 ? "text-rose-600 font-medium" : ""}>Your Names</span>
        <span className={step === 2 ? "text-rose-600 font-medium" : ""}>Wedding Details</span>
        <span className={step === 3 ? "text-rose-600 font-medium" : ""}>Your Account</span>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-8">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Names */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Introduce the happy couple</h2>
                <p className="text-sm text-gray-400 mt-1">Tell us your names</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type="text" value={yourName} onChange={(e) => setYourName(e.target.value)} placeholder="Enter your name" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Partner&apos;s Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Enter partner's name" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Wedding Details */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CalendarIcon className="w-7 h-7 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">When &amp; Where?</h2>
                <p className="text-sm text-gray-400 mt-1">Wedding date and venue</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Wedding Date</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCalendarOpen(!calendarOpen)}
                      className="w-full flex items-center gap-2 pl-3 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-sm text-left hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                    >
                      <CalendarIcon className="w-4 h-4 text-gray-300 shrink-0" />
                      {weddingDate ? (
                        <span className="text-gray-700">{format(weddingDate, "PPP")}</span>
                      ) : (
                        <span className="text-gray-300">Pick a date</span>
                      )}
                    </button>
                    {calendarOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setCalendarOpen(false)} />
                        <div className="absolute left-0 top-full mt-1 z-50 rounded-xl border border-gray-200 bg-white shadow-lg">
                          <Calendar
                            mode="single"
                            selected={weddingDate}
                            onSelect={(date) => { setWeddingDate(date); setCalendarOpen(false); }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            autoFocus
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Venue</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Cinnamon Grand, Colombo" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Account */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-7 h-7 text-teal-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Create Your Account</h2>
                <p className="text-sm text-gray-400 mt-1">Almost done! Just a few more details.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="077 123 4567" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" minLength={8} className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          {step < 3 ? (
            <button onClick={() => canGoNext() && setStep(step + 1)} disabled={!canGoNext()} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canGoNext() || loading} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Sparkles className="w-4 h-4" /> Create My Invitation</>}
            </button>
          )}
        </div>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-gray-400 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-rose-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
