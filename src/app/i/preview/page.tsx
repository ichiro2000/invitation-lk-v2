"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { InvitationData } from "@/types/invitation";
import type { TemplateConfig } from "@/types/template-config";
import { Loader2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templates: Record<string, React.ComponentType<any>> = {
  "royal-elegance": dynamic(() => import("@/components/templates/RoyalElegance"), { ssr: false }),
  "modern-bloom": dynamic(() => import("@/components/templates/ModernBloom"), { ssr: false }),
  "golden-lotus": dynamic(() => import("@/components/templates/GoldenLotus"), { ssr: false }),
  "minimal-grace": dynamic(() => import("@/components/templates/MinimalGrace"), { ssr: false }),
  "tropical-paradise": dynamic(() => import("@/components/templates/TropicalParadise"), { ssr: false }),
  "eternal-night": dynamic(() => import("@/components/templates/EternalNight"), { ssr: false }),
  "sinhala-mangalya": dynamic(() => import("@/components/templates/SinhalaMangalya"), { ssr: false }),
  "vintage-botanical": dynamic(() => import("@/components/templates/VintageBotanical"), { ssr: false }),
  "rose-garden": dynamic(() => import("@/components/templates/RoseGarden"), { ssr: false }),
};

interface PreviewMessage {
  type: "preview-update";
  templateSlug: string;
  data: InvitationData;
  config: TemplateConfig;
}

export default function PreviewPage() {
  const [templateSlug, setTemplateSlug] = useState<string>("royal-elegance");
  const [data, setData] = useState<InvitationData | null>(null);
  const [config, setConfig] = useState<TemplateConfig>({});
  const [ready, setReady] = useState(false);

  const handleMessage = useCallback((event: MessageEvent) => {
    // Only accept messages from same origin
    if (event.origin !== window.location.origin) return;
    const msg = event.data as PreviewMessage;
    if (msg?.type !== "preview-update") return;

    setTemplateSlug(msg.templateSlug || "royal-elegance");
    setData(msg.data);
    setConfig(msg.config || {});
    setReady(true);
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    // Tell parent we're ready
    window.parent.postMessage({ type: "preview-ready" }, "*");
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-rose-400 mx-auto mb-2" />
          <p className="text-xs text-gray-400">Waiting for editor...</p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TemplateComponent = templates[templateSlug] as React.ComponentType<any>;
  if (!TemplateComponent) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Template not found</div>;
  }

  return <TemplateComponent data={data} config={config} />;
}
