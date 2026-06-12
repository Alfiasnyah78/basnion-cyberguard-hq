import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/BrandLogo";
import { toast } from "sonner";
import { DEFAULT_SITE_CONTENT, SITE_CONTENT_KEY, type SiteContent, type SocialLink } from "@/lib/site-content";
import { GalleryUploadManager } from "@/components/admin/GalleryUploadManager";
import { BlogManager } from "@/components/admin/BlogManager";
import { LogoManager } from "@/components/admin/LogoManager";
import { SecurityManager } from "@/components/admin/SecurityManager";
import { AuditLogManager } from "@/components/admin/AuditLogManager";
import { logAudit } from "@/lib/audit";
import { Loader2, LogOut, Plus, Trash2, Image as ImageIcon, Trophy, ExternalLink, ShieldCheck, FileText, Save, RotateCcw, ImagePlus, Newspaper, Lock, ScrollText } from "lucide-react";

export const Route = createFileRoute("/Hosu35Hioasss/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Basnion Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type Tab = "content" | "logo" | "gallery" | "programs" | "blog" | "security" | "audit";

function AdminDashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<Tab>("content");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/Hosu35Hioasss" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      if (!roles?.some(r => r.role === "admin")) {
        await supabase.auth.signOut();
        navigate({ to: "/Hosu35Hioasss" });
        return;
      }
      setEmail(session.user.email ?? "");
      setReady(true);
    })();
  }, [navigate]);

  const logout = async () => {
    await logAudit("logout");
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate({ to: "/Hosu35Hioasss" });
  };

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-9 w-9" alt="" />
            <div className="min-w-0">
              <div className="font-display font-bold tracking-wider">BASNION</div>
              <div className="text-[10px] font-mono text-primary flex items-center gap-1">
                <ShieldCheck size={10} /> ADMIN PANEL
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary">
              <ExternalLink size={12} /> view site
            </Link>
            <span className="hidden md:inline text-xs font-mono text-muted-foreground truncate max-w-[200px]">{email}</span>
            <button onClick={logout} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-destructive/40 text-destructive font-mono text-xs hover:bg-destructive/10">
              <LogOut size={14} /> <span className="hidden sm:inline">logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="font-display font-black text-2xl sm:text-3xl mb-2">Content Management</h1>
        <p className="font-mono text-xs sm:text-sm text-muted-foreground">&gt; kelola semua konten landing page basnion</p>

        <div className="flex gap-1 sm:gap-2 mt-6 border-b border-primary/20 overflow-x-auto scrollbar-thin">
          {([
            ["content", "Site Content", FileText],
            ["logo", "Logo", ImagePlus],
            ["gallery", "Gallery", ImageIcon],
            ["programs", "Programs", Trophy],
            ["blog", "Blog", Newspaper],
            ["security", "Security", Lock],
            ["audit", "Audit Log", ScrollText],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 font-mono text-xs sm:text-sm border-b-2 transition whitespace-nowrap ${
                tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "content" && <SiteContentManager />}
          {tab === "logo" && <LogoManager />}
          {tab === "gallery" && <GalleryUploadManager />}
          {tab === "programs" && <ProgramsManager />}
          {tab === "blog" && <BlogManager />}
          {tab === "security" && <SecurityManager />}
          {tab === "audit" && <AuditLogManager />}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ SITE CONTENT ═══════════════════════ */

function SiteContentManager() {
  const qc = useQueryClient();
  const { data: stored, isLoading } = useQuery({
    queryKey: ["admin-site-content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", SITE_CONTENT_KEY).maybeSingle();
      return (data?.value as SiteContent | null) ?? null;
    },
  });

  const [c, setC] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    setC({ ...DEFAULT_SITE_CONTENT, ...(stored ?? {}) } as SiteContent);
  }, [stored]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").upsert({ key: SITE_CONTENT_KEY, value: c as never });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Konten tersimpan");
      void logAudit("site_content_update", { target: SITE_CONTENT_KEY });
      qc.invalidateQueries({ queryKey: ["admin-site-content"] });
      qc.invalidateQueries({ queryKey: ["site_content"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetDefault = () => {
    if (confirm("Reset semua konten ke default?")) setC(DEFAULT_SITE_CONTENT);
  };

  if (isLoading) return <Loader2 className="animate-spin text-primary" />;

  const update = <K extends keyof SiteContent>(k: K, v: SiteContent[K]) => setC({ ...c, [k]: v });

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/90 backdrop-blur border-b border-primary/20 flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">&gt; perubahan langsung terlihat di landing page setelah save</span>
        <div className="flex gap-2">
          <button onClick={resetDefault} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-primary/30 text-primary font-mono text-xs hover:bg-primary/10">
            <RotateCcw size={12} /> reset
          </button>
          <button onClick={() => save.mutate()} disabled={save.isPending} className="inline-flex items-center gap-1 px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-mono text-xs font-semibold neon-glow disabled:opacity-50">
            <Save size={12} /> {save.isPending ? "saving..." : "./save"}
          </button>
        </div>
      </div>

      {/* HERO */}
      <Section title="HERO">
        <Field label="badge" value={c.hero.badge} onChange={v => update("hero", { ...c.hero, badge: v })} />
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="title_line1" value={c.hero.title_line1} onChange={v => update("hero", { ...c.hero, title_line1: v })} />
          <Field label="title_line2 (neon)" value={c.hero.title_line2} onChange={v => update("hero", { ...c.hero, title_line2: v })} />
          <Field label="title_line3" value={c.hero.title_line3} onChange={v => update("hero", { ...c.hero, title_line3: v })} />
        </div>
        <TextArea label="description" value={c.hero.description} onChange={v => update("hero", { ...c.hero, description: v })} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="cta_primary" value={c.hero.cta_primary} onChange={v => update("hero", { ...c.hero, cta_primary: v })} />
          <Field label="cta_secondary" value={c.hero.cta_secondary} onChange={v => update("hero", { ...c.hero, cta_secondary: v })} />
        </div>
        <StringList label="tags" items={c.hero.tags} onChange={v => update("hero", { ...c.hero, tags: v })} placeholder="ethical_hacking" />
        <StringList label="terminal_lines" items={c.hero.terminal_lines} onChange={v => update("hero", { ...c.hero, terminal_lines: v })} placeholder="$ command --flag" textarea />
      </Section>

      {/* MARQUEE */}
      <Section title="MARQUEE">
        <StringList label="marquee_items" items={c.marquee} onChange={v => update("marquee", v)} placeholder="HACK TO LEARN" />
      </Section>

      {/* ABOUT */}
      <Section title="ABOUT">
        <Field label="label" value={c.about.label} onChange={v => update("about", { ...c.about, label: v })} />
        <Field label="title" value={c.about.title} onChange={v => update("about", { ...c.about, title: v })} />
        <StringList label="paragraphs" items={c.about.paragraphs} onChange={v => update("about", { ...c.about, paragraphs: v })} placeholder="Paragraf about..." textarea />
        <TextArea label="etymology_note" value={c.about.etymology_note} onChange={v => update("about", { ...c.about, etymology_note: v })} />
        <ObjectList
          label="cards (title + text)"
          items={c.about.cards}
          template={{ title: "", text: "" }}
          fields={[{ k: "title", label: "title" }, { k: "text", label: "text", textarea: true }]}
          onChange={v => update("about", { ...c.about, cards: v })}
        />
      </Section>

      {/* VISION */}
      <Section title="VISI & MISI">
        <TextArea label="visi" value={c.vision.visi} onChange={v => update("vision", { ...c.vision, visi: v })} />
        <StringList label="misi" items={c.vision.misi} onChange={v => update("vision", { ...c.vision, misi: v })} placeholder="Poin misi..." textarea />
      </Section>

      {/* PHILOSOPHY */}
      <Section title="PHILOSOPHY">
        <TextArea label="intro" value={c.philosophy.intro} onChange={v => update("philosophy", { ...c.philosophy, intro: v })} />
        <Field label="motto" value={c.philosophy.motto} onChange={v => update("philosophy", { ...c.philosophy, motto: v })} />
        <Field label="motto_credit" value={c.philosophy.motto_credit} onChange={v => update("philosophy", { ...c.philosophy, motto_credit: v })} />
      </Section>

      {/* SECTION HEADINGS */}
      <Section title="SECTION HEADINGS">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="programs.label" value={c.programs_intro.label} onChange={v => update("programs_intro", { ...c.programs_intro, label: v })} />
          <Field label="programs.title" value={c.programs_intro.title} onChange={v => update("programs_intro", { ...c.programs_intro, title: v })} />
          <Field label="gallery.label" value={c.gallery_intro.label} onChange={v => update("gallery_intro", { ...c.gallery_intro, label: v })} />
          <Field label="gallery.title" value={c.gallery_intro.title} onChange={v => update("gallery_intro", { ...c.gallery_intro, title: v })} />
        </div>
      </Section>

      {/* FOOTER */}
      <Section title="FOOTER & CONTACT">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="tagline_line1" value={c.footer.tagline_line1} onChange={v => update("footer", { ...c.footer, tagline_line1: v })} />
          <Field label="tagline_line2" value={c.footer.tagline_line2} onChange={v => update("footer", { ...c.footer, tagline_line2: v })} />
          <Field label="email" value={c.footer.email} onChange={v => update("footer", { ...c.footer, email: v })} />
          <Field label="website" value={c.footer.website} onChange={v => update("footer", { ...c.footer, website: v })} />
        </div>
        <Field label="copyright_suffix" value={c.footer.copyright_suffix} onChange={v => update("footer", { ...c.footer, copyright_suffix: v })} />
        <ObjectList
          label="social links"
          items={c.footer.socials}
          template={{ label: "", href: "", icon: "globe" } as SocialLink}
          fields={[
            { k: "label", label: "label" },
            { k: "href", label: "url" },
            { k: "icon", label: "icon", select: ["instagram", "linkedin", "github", "twitter", "youtube", "globe", "mail"] },
          ]}
          onChange={v => update("footer", { ...c.footer, socials: v })}
        />
      </Section>
    </div>
  );
}

/* ─── Reusable form primitives ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-5 neon-border space-y-3">
      <h3 className="font-display font-bold tracking-widest text-primary text-sm">// {title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] text-primary/80">$ {label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] text-primary/80">$ {label}</span>
      <textarea
        value={value}
        rows={3}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 resize-y"
      />
    </label>
  );
}

function StringList({
  label, items, onChange, placeholder, textarea,
}: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string; textarea?: boolean }) {
  const update = (i: number, v: string) => onChange(items.map((it, idx) => idx === i ? v : it));
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-primary/80">$ {label} [{items.length}]</span>
        <button type="button" onClick={() => onChange([...items, ""])} className="text-primary text-xs font-mono inline-flex items-center gap-1 hover:text-primary/80">
          <Plus size={12} /> add
        </button>
      </div>
      <div className="mt-2 space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex gap-2 items-start">
            {textarea ? (
              <textarea value={v} placeholder={placeholder} rows={2} onChange={e => update(i, e.target.value)} className="flex-1 px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 resize-y" />
            ) : (
              <input value={v} placeholder={placeholder} onChange={e => update(i, e.target.value)} className="flex-1 px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60" />
            )}
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="mt-2 text-destructive hover:text-destructive/80" aria-label="remove">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

type FieldDef<T> = { k: keyof T; label: string; textarea?: boolean; select?: string[] };

function ObjectList<T extends Record<string, string>>({
  label, items, template, fields, onChange,
}: { label: string; items: T[]; template: T; fields: FieldDef<T>[]; onChange: (v: T[]) => void }) {
  const update = (i: number, key: keyof T, v: string) =>
    onChange(items.map((it, idx) => idx === i ? { ...it, [key]: v } : it));
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-primary/80">$ {label} [{items.length}]</span>
        <button type="button" onClick={() => onChange([...items, { ...template }])} className="text-primary text-xs font-mono inline-flex items-center gap-1 hover:text-primary/80">
          <Plus size={12} /> add
        </button>
      </div>
      <div className="mt-2 space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-primary/20 p-3 bg-input/40 space-y-2 relative">
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-destructive hover:text-destructive/80" aria-label="remove">
              <Trash2 size={14} />
            </button>
            {fields.map(f => (
              <label key={String(f.k)} className="block">
                <span className="font-mono text-[10px] text-primary/70">{f.label}</span>
                {f.select ? (
                  <select value={it[f.k]} onChange={e => update(i, f.k, e.target.value)} className="mt-1 w-full px-2 py-1.5 rounded-md bg-background border border-primary/30 font-mono text-xs">
                    {f.select.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : f.textarea ? (
                  <textarea value={it[f.k]} rows={2} onChange={e => update(i, f.k, e.target.value)} className="mt-1 w-full px-2 py-1.5 rounded-md bg-background border border-primary/30 font-mono text-xs resize-y" />
                ) : (
                  <input value={it[f.k]} onChange={e => update(i, f.k, e.target.value)} className="mt-1 w-full px-2 py-1.5 rounded-md bg-background border border-primary/30 font-mono text-xs" />
                )}
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* (legacy GalleryManager removed — replaced by GalleryUploadManager) */

/* ═══════════════════════ PROGRAMS ═══════════════════════ */

function ProgramsManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-programs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("programs").select("*").order("sort_order").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({ title: "", description: "", event_date: "", sort_order: 0 });

  const create = useMutation({
    mutationFn: async () => {
      const payload = { ...form, event_date: form.event_date || null };
      const { error } = await supabase.from("programs").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Program added");
      setForm({ title: "", description: "", event_date: "", sort_order: 0 });
      qc.invalidateQueries({ queryKey: ["admin-programs"] });
      qc.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("programs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-programs"] });
      qc.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
      <form
        onSubmit={e => { e.preventDefault(); if (!form.title || !form.description) return; create.mutate(); }}
        className="glass-card rounded-xl p-5 neon-border space-y-3 h-fit"
      >
        <h3 className="font-display font-bold flex items-center gap-2">
          <Plus size={16} className="text-primary" /> Add Program
        </h3>
        <Input label="title" value={form.title} onChange={v => setForm({ ...form, title: v })} required />
        <Textarea label="description" value={form.description} onChange={v => setForm({ ...form, description: v })} required />
        <Input label="event_date" type="date" value={form.event_date} onChange={v => setForm({ ...form, event_date: v })} />
        <Input label="sort_order" type="number" value={String(form.sort_order)} onChange={v => setForm({ ...form, sort_order: Number(v) || 0 })} />
        <button type="submit" disabled={create.isPending} className="w-full py-2 rounded-md bg-primary text-primary-foreground font-mono font-semibold neon-glow disabled:opacity-50">
          {create.isPending ? "saving..." : "./save"}
        </button>
      </form>

      <div className="space-y-3">
        {isLoading && <Loader2 className="animate-spin text-primary" />}
        {data?.length === 0 && (
          <div className="glass-card rounded-xl p-10 text-center font-mono text-sm text-muted-foreground">&gt; no programs yet</div>
        )}
        {data?.map(p => (
          <div key={p.id} className="glass-card rounded-lg p-4 neon-border flex items-start gap-4">
            <div className="grid place-items-center h-10 w-10 rounded-md bg-primary/10 border border-primary/30 shrink-0">
              <Trophy size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-semibold">{p.title}</h4>
                <button onClick={() => { if (confirm("Delete this program?")) del.mutate(p.id); }} className="text-destructive hover:text-destructive/80" aria-label="delete">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
              {p.event_date && (
                <p className="text-xs font-mono text-primary/70 mt-2">{new Date(p.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── shared inputs ─── */

function Input({
  label, value, onChange, type = "text", required, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] text-primary/80">$ {label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
      />
    </label>
  );
}

function Textarea({
  label, value, onChange, required,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] text-primary/80">$ {label}</span>
      <textarea
        required={required}
        value={value}
        rows={3}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 resize-y"
      />
    </label>
  );
}
