import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SocialLink = { label: string; href: string; icon: "instagram" | "linkedin" | "github" | "twitter" | "youtube" | "globe" | "mail" };

export type SiteContent = {
  hero: {
    badge: string;
    title_line1: string;
    title_line2: string;
    title_line3: string;
    description: string;
    cta_primary: string;
    cta_secondary: string;
    tags: string[];
    terminal_lines: string[];
  };
  marquee: string[];
  about: {
    label: string;
    title: string;
    paragraphs: string[];
    etymology_note: string;
    cards: { title: string; text: string }[];
  };
  vision: {
    visi: string;
    misi: string[];
  };
  philosophy: {
    intro: string;
    motto: string;
    motto_credit: string;
  };
  programs_intro: {
    label: string;
    title: string;
  };
  gallery_intro: {
    label: string;
    title: string;
  };
  footer: {
    tagline_line1: string;
    tagline_line2: string;
    email: string;
    website: string;
    socials: SocialLink[];
    copyright_suffix: string;
  };
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    badge: "SYSTEM ONLINE — HARBAS ONION CTF",
    title_line1: "FROM",
    title_line2: "CURIOSITY",
    title_line3: "TO CYBERSECURITY.",
    description:
      "Komunitas Cyber Security SMK Harapan Bangsa. Kami mengupas dunia digital lapis demi lapis — belajar, berkompetisi, dan melindungi.",
    cta_primary: "./initiate",
    cta_secondary: "view_programs()",
    tags: ["ethical_hacking", "ctf_competitions", "reverse_engineering", "web_exploitation"],
    terminal_lines: [
      "$ scan --target harbas.onion",
      "$ enumerate --layers all",
      "$ exploit --mode ethical",
      "$ flag{ctf_harbas} → ACCESS GRANTED",
    ],
  },
  marquee: [
    "HACK TO LEARN", "LEARN TO SECURE", "FLAG{CTF_HARBAS}", "ROOT@BASNION",
    "0x00 → 0xFF", "LAYERED SECURITY", "ETHICAL HACKING", "CAPTURE THE FLAG",
  ],
  about: {
    label: "// about_basnion",
    title: "Apa itu BASNION?",
    paragraphs: [
      "Harbas Onion CTF Community (Basnion) adalah IT Club Cyber Security di SMK Harapan Bangsa yang berfokus pada keamanan siber. Kami membangun kesadaran dan kompetensi siswa dalam menghadapi ancaman dunia digital yang semakin kompleks.",
      "Basnion menyediakan wadah bagi siswa untuk belajar dan berbagi pengetahuan mengenai berbagai aspek keamanan siber melalui kompetisi CTF.",
    ],
    etymology_note:
      "Komunitas pejuang cybersecurity SMK Harapan Bangsa yang terus belajar, berkembang, dan melindungi dunia digital dengan kecerdasan serta etika.",
    cards: [
      { title: "Kesadaran Keamanan", text: "Membangun cyber awareness di kalangan siswa SMK." },
      { title: "Kompetensi Digital", text: "Meningkatkan skill menghadapi ancaman digital modern." },
    ],
  },
  vision: {
    visi:
      "Menjadi komunitas siswa SMK unggulan dalam bidang keamanan siber yang aktif, kolaboratif, dan berkontribusi nyata terhadap literasi keamanan digital di lingkungan sekolah dan masyarakat.",
    misi: [
      "Menyediakan ruang belajar bersama terkait cyber security berbasis kolaborasi.",
      "Mendorong partisipasi anggota dalam kompetisi CTF, bug bounty, dan event teknologi lainnya.",
    ],
  },
  philosophy: {
    intro: "Setiap elemen logo Basnion membawa makna — dari onion routing hingga ethical hacking.",
    motto: "Hack to Learn, Learn to Secure.",
    motto_credit: "— motto.basnion",
  },
  programs_intro: { label: "// programs --list", title: "Program Kerja" },
  gallery_intro: { label: "// gallery --recent", title: "Gallery" },
  footer: {
    tagline_line1: "from_curiosity to cybersecurity",
    tagline_line2: "smk harapan bangsa",
    email: "basnion@smkharapanbangsa.id",
    website: "basnion.my.id",
    socials: [
      { label: "Instagram", href: "https://instagram.com/Basnion", icon: "instagram" },
      { label: "LinkedIn", href: "https://linkedin.com/company/harbas-onion", icon: "linkedin" },
      { label: "GitHub", href: "https://github.com/basnion", icon: "github" },
    ],
    copyright_suffix: "BASNION · Harbas Onion CTF Community · SMK Harapan Bangsa",
  },
};

export const SITE_CONTENT_KEY = "site_content";

function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T;
  if (typeof base === "object" && typeof override === "object") {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const k of Object.keys(override as Record<string, unknown>)) {
      const b = (base as Record<string, unknown>)[k];
      const o = (override as Record<string, unknown>)[k];
      out[k] = b !== undefined ? deepMerge(b as unknown, o) : o;
    }
    return out as T;
  }
  return (override as T) ?? base;
}

export function useSiteContent(): SiteContent {
  const { data } = useQuery({
    queryKey: ["site_content"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", SITE_CONTENT_KEY)
        .maybeSingle();
      return data?.value ?? null;
    },
  });
  return deepMerge(DEFAULT_SITE_CONTENT, data);
}
