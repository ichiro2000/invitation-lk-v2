export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: "serif" | "sans-serif" | "cursive";
}

export interface SectionConfig {
  id: string;
  visible: boolean;
  order: number;
}

export interface ContentOverrides {
  hero?: {
    subtitle?: string;
    message?: string;
  };
  story?: {
    title?: string;
    subtitle?: string;
    items?: { year: string; title: string; description: string }[];
  };
  venue?: {
    mapUrl?: string; // Google Maps share/embed URL
    second?: {
      name?: string;
      address?: string;
      mapUrl?: string;
    };
  };
  gallery?: {
    images?: string[]; // base64 data URIs (max 3)
  };
  rsvp?: {
    title?: string;
    deadline?: string;
  };
  footer?: {
    message?: string;
    groomPhone?: string;
    bridePhone?: string;
  };
  /** Wings of Honour — mission dossier overlay */
  mission?: {
    codename?: string;
    fileNo?: string;
    clearance?: string;
    briefing?: string;
    classification?: string;
    operatives?: string;
    status?: string;
    visible?: boolean; // default true
  };
  /** Wings of Honour — ATC radio chatter ticker */
  atc?: {
    messages?: string[];
    visible?: boolean; // default true
  };
  /** Wings of Honour — circular couple portrait */
  portrait?: {
    image?: string; // URL or data URI
    visible?: boolean; // default true
  };
}

export interface TemplateConfig {
  theme?: Partial<ThemeConfig>;
  sections?: SectionConfig[];
  content?: ContentOverrides;
}

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "hero", visible: true, order: 0 },
  { id: "countdown", visible: true, order: 1 },
  { id: "story", visible: true, order: 2 },
  { id: "events", visible: true, order: 3 },
  { id: "gallery", visible: true, order: 4 },
  { id: "venue", visible: true, order: 5 },
  { id: "rsvp", visible: true, order: 6 },
  { id: "footer", visible: true, order: 7 },
];

export const SECTION_LABELS: Record<string, string> = {
  hero: "Hero / Couple Intro",
  countdown: "Countdown Timer",
  story: "Love Story",
  events: "Wedding Events",
  gallery: "Photo Gallery",
  venue: "Venue & Map",
  rsvp: "RSVP Form",
  footer: "Footer",
};

export const FONT_OPTIONS = [
  { value: "serif", label: "Serif (Classic)" },
  { value: "sans-serif", label: "Sans-serif (Modern)" },
  { value: "cursive", label: "Cursive (Romantic)" },
] as const;
