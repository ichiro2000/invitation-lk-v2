import { Phone, Sparkles } from "lucide-react";

export default function DevNoticeBanner() {
  return (
    <div className="bg-gradient-to-r from-rose-500 via-rose-500 to-amber-500 text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <p className="text-xs sm:text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>
            This site is under development — releasing to you soon. Need our services now?
          </span>
        </p>
        <a
          href="tel:+94767676777"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-xs sm:text-sm font-semibold"
        >
          <Phone className="w-3.5 h-3.5" aria-hidden="true" />
          +94 76 767 6777
        </a>
      </div>
    </div>
  );
}
