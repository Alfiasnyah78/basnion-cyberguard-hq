import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import logoAsset from "@/assets/basnion-logo.png.asset.json";
import { MatrixRain } from "@/components/MatrixRain";
import { Terminal } from "@/components/Terminal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
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

const visiMisi = {
  visi: "Menjadi komunitas siswa SMK unggulan dalam bidang keamanan siber yang aktif, kolaboratif, dan berkontribusi nyata terhadap literasi keamanan digital di lingkungan sekolah dan masyarakat.",
  misi: [
    { icon: BookOpen, text: "Menyediakan ruang belajar bersama terkait cyber security berbasis kolaborasi." },
    { icon: Trophy, text: "Mendorong partisipasi anggota dalam kompetisi CTF, bug bounty, dan event teknologi lainnya." },
  ],
};

function Landing() {
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
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "var(--gradient-hero)" }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center py-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neon-border text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-neon" />
              <span className="text-primary">SYSTEM ONLINE — HARBAS ONION CTF</span>
            </div>

            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              <span className="block text-foreground">FROM</span>
              <span className="block neon-text">CURIOSITY</span>
              <span className="block text-foreground">TO CYBER<span className="neon-text">SECURITY</span>.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl font-mono leading-relaxed">
              <span className="text-primary">&gt;</span> Komunitas Cyber Security SMK Harapan Bangsa.
              Kami mengupas dunia digital lapis demi lapis — belajar, berkompetisi, dan melindungi.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#about"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-mono font-semibold neon-glow hover:scale-105 transition-transform"
              >
                ./initiate
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#programs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md neon-border text-primary font-mono hover:bg-primary/10 transition"
              >
                view_programs()
              </a>
            </div>

            <div className="flex flex-wrap gap-6 pt-4 text-xs font-mono text-muted-foreground">
              <div><span className="text-primary">{">"}</span> ethical_hacking</div>
              <div><span className="text-primary">{">"}</span> ctf_competitions</div>
              <div><span className="text-primary">{">"}</span> reverse_engineering</div>
              <div><span className="text-primary">{">"}</span> web_exploitation</div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full animate-pulse-neon" />
            <img
              src={logoAsset.url}
              alt="Basnion Logo"
              className="relative w-[340px] sm:w-[440px] animate-float-slow drop-shadow-[0_0_40px_oklch(0.85_0.25_145/0.5)]"
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
        </div>

        {/* terminal overlay */}
        <div className="absolute bottom-8 left-4 right-4 sm:left-8 sm:right-auto sm:max-w-md z-10">
          <div className="glass-card rounded-lg p-4 neon-border">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="ml-2 text-[10px] font-mono text-muted-foreground">root@basnion:~#</span>
            </div>
            <Terminal
              loop
              lines={[
                "$ scan --target harbas.onion",
                "$ enumerate --layers all",
                "$ exploit --mode ethical",
                "$ flag{ctf_harbas} → ACCESS GRANTED",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ──────────────────────────── */}
      <div className="border-y border-primary/20 bg-background/60 backdrop-blur overflow-hidden py-3">
        <div className="flex gap-12 animate-marquee whitespace-nowrap font-mono text-sm text-primary/70">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12">
              {["HACK TO LEARN", "LEARN TO SECURE", "FLAG{CTF_HARBAS}", "ROOT@BASNION", "0x00 → 0xFF", "LAYERED SECURITY", "ETHICAL HACKING", "CAPTURE THE FLAG"].map((t, i) => (
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
          <SectionLabel>// about_basnion</SectionLabel>
          <h2 className="font-display font-black text-4xl sm:text-5xl mt-4 mb-8">
            Apa itu <span className="neon-text">BASNION</span>?
          </h2>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p>
                <span className="text-primary font-semibold">Harbas Onion CTF Community (Basnion)</span> adalah
                IT Club Cyber Security di SMK Harapan Bangsa yang berfokus pada keamanan siber.
                Kami membangun kesadaran dan kompetensi siswa dalam menghadapi ancaman dunia digital yang semakin kompleks.
              </p>
              <p>
                Basnion menyediakan wadah bagi siswa untuk belajar dan berbagi pengetahuan
                mengenai berbagai aspek keamanan siber melalui kompetisi CTF.
              </p>
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
                &gt; "Komunitas pejuang cybersecurity SMK Harapan Bangsa yang terus belajar,<br />
                &nbsp;&nbsp;berkembang, dan melindungi dunia digital dengan kecerdasan serta etika."
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            {[
              { icon: Shield, title: "Kesadaran Keamanan", text: "Membangun cyber awareness di kalangan siswa SMK." },
              { icon: GraduationCap, title: "Kompetensi Digital", text: "Meningkatkan skill menghadapi ancaman digital modern." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="glass-card rounded-lg p-5 flex gap-4 hover:neon-border transition-all">
                <Icon size={28} className="text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{text}</p>
                </div>
              </div>
            ))}
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
                <p className="text-lg leading-relaxed text-foreground">{visiMisi.visi}</p>
              </div>
            </div>

            <div className="glass-card rounded-xl p-8 neon-border">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-primary mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-neon" />
                MISI.exe
              </div>
              <ul className="space-y-4">
                {visiMisi.misi.map(({ icon: Icon, text }, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="grid place-items-center h-10 w-10 rounded-md bg-primary/10 border border-primary/30 shrink-0">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed pt-1.5">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PHILOSOPHY (LOGO) ─────────────────── */}
      <section id="philosophy" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>// logo_philosophy</SectionLabel>
          <h2 className="font-display font-black text-4xl sm:text-5xl mt-4 mb-4">
            Filosofi <span className="neon-text">Logo</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl font-mono text-sm">
            &gt; Setiap elemen logo Basnion membawa makna — dari onion routing hingga ethical hacking.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {logoElements.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group relative glass-card rounded-xl p-5 hover:-translate-y-1 hover:neon-border transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon size={32} className="text-primary mb-3 relative" />
                <h3 className="font-display font-bold text-lg relative">{title}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed relative">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 glass-card rounded-xl p-8 neon-border text-center">
            <Sparkles className="mx-auto text-primary mb-3" size={24} />
            <p className="font-display text-2xl sm:text-3xl font-bold">
              "Hack to <span className="neon-text">Learn</span>, Learn to <span className="neon-text">Secure</span>."
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-3">— motto.basnion</p>
          </div>
        </div>
      </section>

      {/* ─── PROGRAMS ──────────────────────────── */}
      <section id="programs" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="absolute inset-0 cyber-grid opacity-10" />
        <div className="relative mx-auto max-w-6xl">
          <SectionLabel>// programs --list</SectionLabel>
          <h2 className="font-display font-black text-4xl sm:text-5xl mt-4 mb-12">
            Program <span className="neon-text">Kerja</span>
          </h2>

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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Trophy, title: "CTF Competitions", text: "Kompetisi Capture The Flag internal & eksternal — challenge web, crypto, pwn, reverse, dan forensics." },
                { icon: BookOpen, title: "Learning Sessions", text: "Sesi belajar bersama tentang ethical hacking, jaringan, dan security tools." },
                { icon: Users, title: "Community Events", text: "Workshop, sharing session, dan kolaborasi dengan komunitas cybersecurity lain." },
              ].map(({ icon: Icon, title, text }) => (
                <article key={title} className="glass-card rounded-xl p-6 hover:neon-border transition-all group">
                  <div className="grid place-items-center h-12 w-12 rounded-md bg-primary/10 border border-primary/30 group-hover:neon-glow transition mb-4">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── GALLERY ───────────────────────────── */}
      <section id="gallery" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>// gallery --recent</SectionLabel>
          <h2 className="font-display font-black text-4xl sm:text-5xl mt-4 mb-12">
            <span className="neon-text">Gallery</span>
          </h2>

          {gallery && gallery.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((g) => (
                <figure key={g.id} className="group relative rounded-xl overflow-hidden neon-border bg-card aspect-[4/3]">
                  <img
                    src={g.image_url}
                    alt={g.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />
                  <figcaption className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display font-bold text-lg">{g.title}</h3>
                    {g.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{g.description}</p>}
                  </figcaption>
                </figure>
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
