import type { TemplateConfig, ThemeConfig } from "@/types/template-config";
import type { InvitationData } from "@/types/invitation";
import { DEFAULT_SECTIONS } from "@/types/template-config";

export interface TemplateEntry {
  slug: string;
  name: string;
  category: string;
  plan: string;
  colorSwatch: string; // CSS class for preview swatch
  defaultTheme: ThemeConfig;
  defaultConfig: TemplateConfig;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TemplateComponent = React.ComponentType<{ data?: InvitationData; config?: TemplateConfig }>;

export const TEMPLATE_REGISTRY: TemplateEntry[] = [
  {
    slug: "royal-elegance",
    name: "Royal Elegance",
    category: "Traditional",
    plan: "STANDARD",
    colorSwatch: "bg-[#5c2828]",
    defaultTheme: {
      primaryColor: "#c9a96e",
      secondaryColor: "#5c2828",
      backgroundColor: "#fdf8f4",
      textColor: "#3d1f1f",
      accentColor: "#8b5e5e",
      fontFamily: "serif",
    },
    defaultConfig: {
      theme: {
        primaryColor: "#c9a96e",
        secondaryColor: "#5c2828",
        backgroundColor: "#fdf8f4",
        textColor: "#3d1f1f",
        accentColor: "#8b5e5e",
        fontFamily: "serif",
      },
      sections: [...DEFAULT_SECTIONS],
      content: {
        hero: { subtitle: "Together with their families", message: "Request the honour of your presence at the celebration of their marriage" },
        story: { title: "Our Love Story" },
        rsvp: { title: "Will You Join Us?", deadline: "Kindly respond by May 15, 2026" },
      },
    },
  },
  {
    slug: "modern-bloom",
    name: "Modern Bloom",
    category: "Modern",
    plan: "BASIC",
    colorSwatch: "bg-pink-300",
    defaultTheme: {
      primaryColor: "#f472b6",
      secondaryColor: "#ec4899",
      backgroundColor: "#fdf2f8",
      textColor: "#1f2937",
      accentColor: "#f9a8d4",
      fontFamily: "sans-serif",
    },
    defaultConfig: {
      theme: { primaryColor: "#f472b6", secondaryColor: "#ec4899", backgroundColor: "#fdf2f8", textColor: "#1f2937", accentColor: "#f9a8d4", fontFamily: "sans-serif" },
      sections: [...DEFAULT_SECTIONS],
      content: { hero: { subtitle: "Together with their families" }, story: { title: "Our Love Story" }, rsvp: { title: "RSVP" } },
    },
  },
  {
    slug: "golden-lotus",
    name: "Golden Lotus",
    category: "Cultural",
    plan: "PREMIUM",
    colorSwatch: "bg-[#2a1515]",
    defaultTheme: {
      primaryColor: "#d4a853",
      secondaryColor: "#1a0a0a",
      backgroundColor: "#0f0505",
      textColor: "#f5e6d3",
      accentColor: "#b8860b",
      fontFamily: "serif",
    },
    defaultConfig: {
      theme: { primaryColor: "#d4a853", secondaryColor: "#1a0a0a", backgroundColor: "#0f0505", textColor: "#f5e6d3", accentColor: "#b8860b", fontFamily: "serif" },
      sections: [...DEFAULT_SECTIONS],
      content: { hero: { subtitle: "Request the pleasure of your company" }, story: { title: "Our Journey" }, rsvp: { title: "Join Our Celebration" } },
    },
  },
  {
    slug: "minimal-grace",
    name: "Minimal Grace",
    category: "Elegant",
    plan: "BASIC",
    colorSwatch: "bg-stone-200",
    defaultTheme: {
      primaryColor: "#c5c0b8",
      secondaryColor: "#a8a29e",
      backgroundColor: "#faf9f6",
      textColor: "#1c1917",
      accentColor: "#78716c",
      fontFamily: "serif",
    },
    defaultConfig: {
      theme: { primaryColor: "#c5c0b8", secondaryColor: "#a8a29e", backgroundColor: "#faf9f6", textColor: "#1c1917", accentColor: "#78716c", fontFamily: "serif" },
      sections: [...DEFAULT_SECTIONS],
      content: { hero: { subtitle: "Together with their families" }, story: { title: "Our Story" }, rsvp: { title: "RSVP" } },
    },
  },
  {
    slug: "tropical-paradise",
    name: "Tropical Paradise",
    category: "Beach",
    plan: "STANDARD",
    colorSwatch: "bg-teal-500",
    defaultTheme: {
      primaryColor: "#fb923c",
      secondaryColor: "#14b8a6",
      backgroundColor: "#ffffff",
      textColor: "#134e4a",
      accentColor: "#5eead4",
      fontFamily: "sans-serif",
    },
    defaultConfig: {
      theme: { primaryColor: "#fb923c", secondaryColor: "#14b8a6", backgroundColor: "#ffffff", textColor: "#134e4a", accentColor: "#5eead4", fontFamily: "sans-serif" },
      sections: [...DEFAULT_SECTIONS],
      content: { hero: { subtitle: "You're invited to celebrate" }, story: { title: "Our Adventure" }, rsvp: { title: "Will You Be There?" } },
    },
  },
  {
    slug: "eternal-night",
    name: "Eternal Night",
    category: "Dark & Moody",
    plan: "PREMIUM",
    colorSwatch: "bg-[#1a2744]",
    defaultTheme: {
      primaryColor: "#c4a35a",
      secondaryColor: "#1a2744",
      backgroundColor: "#0a0e1a",
      textColor: "#ffffff",
      accentColor: "#7c6f9b",
      fontFamily: "serif",
    },
    defaultConfig: {
      theme: { primaryColor: "#c4a35a", secondaryColor: "#1a2744", backgroundColor: "#0a0e1a", textColor: "#ffffff", accentColor: "#7c6f9b", fontFamily: "serif" },
      sections: [...DEFAULT_SECTIONS],
      content: { hero: { subtitle: "Under the stars" }, story: { title: "Written in the Stars" }, rsvp: { title: "Join the Celebration" } },
    },
  },
  {
    slug: "sinhala-mangalya",
    name: "Sinhala Mangalya",
    category: "Traditional",
    plan: "STANDARD",
    colorSwatch: "bg-pink-400",
    defaultTheme: {
      primaryColor: "#ec4899",
      secondaryColor: "#db2777",
      backgroundColor: "#fff8f9",
      textColor: "#831843",
      accentColor: "#f9a8d4",
      fontFamily: "serif",
    },
    defaultConfig: {
      theme: { primaryColor: "#ec4899", secondaryColor: "#db2777", backgroundColor: "#fff8f9", textColor: "#831843", accentColor: "#f9a8d4", fontFamily: "serif" },
      sections: [...DEFAULT_SECTIONS],
      content: { hero: { subtitle: "සුභ මංගල්‍යයට ආරාධනා" }, story: { title: "අපේ ආදර කතාව" }, rsvp: { title: "ඔබත් එන්නද?" } },
    },
  },
  {
    slug: "vintage-botanical",
    name: "Vintage Botanical",
    category: "Elegant",
    plan: "STANDARD",
    colorSwatch: "bg-green-600",
    defaultTheme: {
      primaryColor: "#16a34a",
      secondaryColor: "#166534",
      backgroundColor: "#fefdf9",
      textColor: "#14532d",
      accentColor: "#86efac",
      fontFamily: "serif",
    },
    defaultConfig: {
      theme: { primaryColor: "#16a34a", secondaryColor: "#166534", backgroundColor: "#fefdf9", textColor: "#14532d", accentColor: "#86efac", fontFamily: "serif" },
      sections: [...DEFAULT_SECTIONS],
      content: { hero: { subtitle: "Together with their families" }, story: { title: "Our Love Story" }, rsvp: { title: "RSVP" } },
    },
  },
  {
    slug: "rose-garden",
    name: "Rose Garden",
    category: "Modern",
    plan: "BASIC",
    colorSwatch: "bg-rose-500",
    defaultTheme: {
      primaryColor: "#f43f5e",
      secondaryColor: "#9f1239",
      backgroundColor: "#fff1f2",
      textColor: "#881337",
      accentColor: "#fda4af",
      fontFamily: "serif",
    },
    defaultConfig: {
      theme: { primaryColor: "#f43f5e", secondaryColor: "#9f1239", backgroundColor: "#fff1f2", textColor: "#881337", accentColor: "#fda4af", fontFamily: "serif" },
      sections: [...DEFAULT_SECTIONS],
      content: { hero: { subtitle: "Together with their families" }, story: { title: "Our Love Story" }, rsvp: { title: "Join Us" } },
    },
  },
  {
    slug: "wings-of-honour",
    name: "Wings of Honour",
    category: "Traditional",
    plan: "PREMIUM",
    colorSwatch: "bg-[#0f2744]",
    defaultTheme: {
      primaryColor: "#c9a268",
      secondaryColor: "#0f2744",
      backgroundColor: "#0f2744",
      textColor: "#ffffff",
      accentColor: "#e6c77a",
      fontFamily: "serif",
    },
    defaultConfig: {
      theme: { primaryColor: "#c9a268", secondaryColor: "#0f2744", backgroundColor: "#0f2744", textColor: "#ffffff", accentColor: "#e6c77a", fontFamily: "serif" },
      sections: [...DEFAULT_SECTIONS],
      content: {
        hero: { subtitle: "WITH THE BLESSINGS OF OUR FAMILIES", message: "we invite you to celebrate the marriage of" },
        story: {
          title: "Flight Path of a Love Story",
          items: [
            { year: "2018", title: "First Salute", description: "We first met at an Air Force charity gala in Colombo." },
            { year: "2020", title: "Letters Across the Sky", description: "Midnight phone calls carried our bond across distance." },
            { year: "2024", title: "The Proposal", description: "At the SLAF base, under a guard of honour, he knelt on one knee." },
            { year: "2026", title: "The Vow", description: "With our families and his brothers-in-arms, we begin our lifelong journey." },
          ],
        },
        rsvp: { title: "Will You Stand With Us?", deadline: "Kindly respond by October 15, 2026" },
        mission: {
          codename: "BLUE WINGS",
          fileNo: "SLAF-2026-1114",
          clearance: "LEVEL ∞",
          briefing: "Contents pertain to the union of two operatives. Attendance is requested. Classification clearance granted upon receipt.",
        },
        atc: {
          messages: [
            "SLAF-114, cleared for approach, runway honour-14",
            "Roger tower, on final, three souls on board",
            "Winds calm, love ceiling unlimited, cleared to land",
            "Copy that, beginning descent to forever",
            "Welcome home, SLAF-114. Godspeed",
          ],
        },
        portrait: { image: "/couple-portrait.png" },
      },
    },
  },
];

export function getTemplateEntry(slug: string): TemplateEntry | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.slug === slug);
}

export function getDefaultConfig(slug: string): TemplateConfig {
  return getTemplateEntry(slug)?.defaultConfig || TEMPLATE_REGISTRY[0].defaultConfig;
}

export function getDefaultTheme(slug: string): ThemeConfig {
  return getTemplateEntry(slug)?.defaultTheme || TEMPLATE_REGISTRY[0].defaultTheme;
}
