import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BrandLogo } from "@/components/BrandLogo";
import { useSignedUrl } from "@/lib/storage";
import { MatrixRain } from "@/components/MatrixRain";
import { Terminal } from "@/components/Terminal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/lib/site-content";
import {
  Shield, Lock, Code2, Skull, Laptop, Layers, Network, Target,
  GraduationCap, Trophy, BookOpen, Users, Sparkles, Zap, ArrowRight
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Basnion — Harbas Onion CTF Community" },
      { name: "description", content: "Komunitas Cyber Security SMK Harapan Bangsa. From Curiosity to Cybersecurity. Pelajari CTF, ethical hacking, dan keamanan siber bersama Basnion." },
      { property: "og:title", content: "Basnion — Harbas Onion CTF Community" },
      { property: "og:description", content: "Hack to Learn, Learn to Secure. Komunitas Cyber Security SMK Harapan Bangsa." },
    ],
  }),
  component: Landing,
});

const logoElements = [
  { icon: Layers, title: "Bawang (Onion)", text: "Lapisan keamanan. Semakin dalam mengupas, semakin banyak ilmu ditemukan." },
  { icon: Code2, title: "Hoodie Hacker", text: "Ethical hacker — Hack to Learn, Learn to Secure." },
  { icon: Laptop, title: "Laptop", text: "Tempat berlatih CTF, riset, eksploitasi, dan analisis." },
  { icon: Lock, title: "Gembok", text: "Kerahasiaan, integritas, dan ketersediaan informasi." },
  { icon: Zap, title: "Hijau Neon", text: "Terminal hacker, pertumbuhan, dan akses." },
  { icon: Shield, title: "Perisai", text: "Cyber defense — bukan hanya mencari celah, tapi juga melindungi." },
  { icon: Skull, title: "Tengkorak Digital", text: "Pantang menyerah sampai flag ditemukan." },
  { icon: Network, title: "Simbol </>", text: "Programming, reverse engineering, web exploitation." },
];

const misiIcons = [BookOpen, Trophy, Users, Sparkles, Shield, Zap];
const aboutCardIcons = [Shield, GraduationCap, Lock, Code2];

function Landing() {
  const content = useSiteContent();

  const { data: programs } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data } = await supabase.from("programs").select("*").order("sort_order").order("created_at");
      return data ?? [];
    },
  });
  const { data: gallery } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data } = await supabase.from("gallery_items").select("*").order("sort_order").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />

      {/* ─── HERO ─────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <MatrixRain className="absolute inset-0 w-full h-full opacity-20" />
        <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-hero)" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center py-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neon-border text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-neon" />
              <span className="text-primary">{content.hero.badge}</span>
            </div>

            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              <span className="block text-foreground">{content.hero.title_line1}</span>
              <span className="block neon-text">{content.hero.title_line2}</span>
              <span className="block text-foreground">{content.hero.title_line3}</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl font-mono leading-relaxed">
              <span className="text-primary">&gt;</span> {content.hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#about" className="group inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-mono font-semibold neon-glow hover:scale-105 transition-transform">
                {content.hero.cta_primary}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#programs" className="inline-flex items-center gap-2 px-6 py-3 rounded-md neon-border text-primary font-mono hover:bg-primary/10 transition">
                {content.hero.cta_secondary}
              </a>
            </div>

            <div className="flex flex-wrap gap-6 pt-4 text-xs font-mono text-muted-foreground">
              {content.hero.tags.map((t) => (
                <div key={t}><span className="text-primary">{">"}</span> {t}</div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full animate-pulse-neon" />
            <BrandLogo className="relative w-[260px] sm:w-[340px] lg:w-[440px] animate-float-slow drop-shadow-[0_0_40px_oklch(0.85_0.25_145/0.5)]" alt="Basnion Logo" />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        </div>

        <div className="absolute bottom-8 left-4 right-4 sm:left-8 sm:right-auto sm:max-w-md z-10">
          <div className="glass-card rounded-lg p-4 neon-border">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="ml-2 text-[10px] font-mono text-muted-foreground">root@basnion:~#</span>
            </div>
            <Terminal loop lines={content.hero.terminal_lines} />
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ──────────────────────────── */}
      <div className="border-y border-primary/20 bg-background/60 backdrop-blur overflow-hidden py-3">
        <div className="flex gap-12 animate-marquee whitespace-nowrap font-mono text-sm text-primary/70">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12">
              {content.marquee.map((t, i) => (
                <span key={i} className="flex items-center gap-12">
                  {t}
                  <span className="text-primary">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── ABOUT ────────────────────────────── */}
      <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>{content.about.label}</SectionLabel>
          <h2 className="font-display font-black text-4xl sm:text-5xl mt-4 mb-8">{content.about.title}</h2>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              {content.about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="glass-card rounded-xl p-6 neon-border space-y-4 font-mono text-sm">
              <div className="text-primary">&gt; etymology --target BASNION</div>
              <div className="grid grid-cols-[80px_1fr] gap-x-4 gap-y-3">
                <span className="text-primary/70">HARBAS</span>
                <span>singkatan dari <strong className="text-foreground">Harapan Bangsa</strong></span>
                <span className="text-primary/70">ONION</span>
                <span>bawang — identik dengan keamanan siber, anonimitas, dan onion routing</span>
              </div>
              <div className="pt-3 border-t border-primary/20 text-xs text-muted-foreground italic">
                &gt; "{content.about.etymology_note}"
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            {content.about.cards.map((c, i) => {
              const Icon = aboutCardIcons[i % aboutCardIcons.length];
              return (
                <div key={i} className="glass-card rounded-lg p-5 flex gap-4 hover:neon-border transition-all">
                  <Icon size={28} className="text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── VISION & MISSION ───────────────────── */}
      <section id="vision" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="absolute inset-0 cyber-grid opacity-10" />
        <div className="relative mx-auto max-w-6xl">
          <SectionLabel>// vision_mission</SectionLabel>
          <h2 className="font-display font-black text-4xl sm:text-5xl mt-4 mb-12">
            Visi & <span className="neon-text">Misi</span>
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-8 neon-border relative overflow-hidden">
              <Target className="absolute -top-4 -right-4 text-primary/10" size={140} />
              <div className="relative">
                <div className="inline-flex items-center gap-2 font-mono text-xs text-primary mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-neon" />
                  VISI.exe
                </div>
                <p className="text-lg leading-relaxed text-foreground">{content.vision.visi}</p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 neon-border">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-primary mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-neon" />
                MISI.exe
              </div>
              <ul className="space-y-4">
                {content.vision.misi.map((text, i) => {
                  const Icon = misiIcons[i % misiIcons.length];
                  return (
                    <li key={i} className="flex gap-4 items-start">
                      <div className="grid place-items-center h-10 w-10 rounded-md bg-primary/10 border border-primary/30 shrink-0">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <p className="text-muted-foreground leading-relaxed pt-1.5">{text}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PHILOSOPHY ─────────────────────────── */}
      <section id="philosophy" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>// logo_philosophy</SectionLabel>
          <h2 className="font-display font-black text-4xl sm:text-5xl mt-4 mb-4">
            Filosofi <span className="neon-text">Logo</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl font-mono text-sm">&gt; {content.philosophy.intro}</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {logoElements.map(({ icon: Icon, title, text }) => (
              <div key={title} className="group relative glass-card rounded-xl p-5 hover:-translate-y-1 hover:neon-border transition-all overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon size={32} className="text-primary mb-3 relative" />
                <h3 className="font-display font-bold text-lg relative">{title}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed relative">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 glass-card rounded-xl p-8 neon-border text-center">
            <Sparkles className="mx-auto text-primary mb-3" size={24} />
            <p className="font-display text-2xl sm:text-3xl font-bold">"{content.philosophy.motto}"</p>
            <p className="font-mono text-xs text-muted-foreground mt-3">{content.philosophy.motto_credit}</p>
          </div>
        </div>
      </section>

      {/* ─── PROGRAMS ──────────────────────────── */}
      <section id="programs" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="absolute inset-0 cyber-grid opacity-10" />
        <div className="relative mx-auto max-w-6xl">
          <SectionLabel>{content.programs_intro.label}</SectionLabel>
          <h2 className="font-display font-black text-4xl sm:text-5xl mt-4 mb-12">{content.programs_intro.title}</h2>

          {programs && programs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {programs.map((p) => (
                <article key={p.id} className="glass-card rounded-xl p-6 hover:neon-border transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="grid place-items-center h-12 w-12 rounded-md bg-primary/10 border border-primary/30 group-hover:neon-glow transition">
                      <Trophy size={20} className="text-primary" />
                    </div>
                    {p.event_date && (
                      <span className="text-xs font-mono text-primary/70">
                        {new Date(p.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-12 text-center neon-border">
              <p className="font-mono text-muted-foreground">&gt; programs are empty — coming soon...</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── GALLERY ───────────────────────────── */}
      <section id="gallery" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>{content.gallery_intro.label}</SectionLabel>
          <h2 className="font-display font-black text-4xl sm:text-5xl mt-4 mb-12">{content.gallery_intro.title}</h2>

          {gallery && gallery.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((g) => (
                <GalleryFigure key={g.id} item={g} />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-12 text-center neon-border">
              <p className="font-mono text-muted-foreground">&gt; gallery is empty — coming soon...</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neon-border text-xs font-mono text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-neon" />
      {children}
    </div>
  );
}

function GalleryFigure({ item }: { item: { id: string; title: string; description: string | null; image_url: string } }) {
  const { data: signed } = useSignedUrl("gallery", item.image_url);
  const src = /^https?:\/\//i.test(item.image_url) ? item.image_url : signed;
  return (
    <figure className="group relative rounded-xl overflow-hidden neon-border bg-card aspect-[4/3]">
      {src ? (
        <img src={src} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full bg-input animate-pulse" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />
      <figcaption className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-display font-bold text-lg">{item.title}</h3>
        {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
      </figcaption>
    </figure>
  );
}
