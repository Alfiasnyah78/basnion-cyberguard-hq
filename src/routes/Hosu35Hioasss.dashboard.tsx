import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/basnion-logo.png.asset.json";
import { toast } from "sonner";
import { Loader2, LogOut, Plus, Trash2, Image as ImageIcon, Trophy, Pencil, X, ExternalLink, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/Hosu35Hioasss/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Basnion Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type Tab = "gallery" | "programs";

function AdminDashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<Tab>("gallery");

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
            <img src={logoAsset.url} alt="" className="h-9 w-9" />
            <div>
              <div className="font-display font-bold tracking-wider">BASNION</div>
              <div className="text-[10px] font-mono text-primary flex items-center gap-1">
                <ShieldCheck size={10} /> ADMIN PANEL
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary">
              <ExternalLink size={12} /> view site
            </Link>
            <span className="hidden md:inline text-xs font-mono text-muted-foreground">{email}</span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-destructive/40 text-destructive font-mono text-xs hover:bg-destructive/10"
            >
              <LogOut size={14} /> logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <h1 className="font-display font-black text-3xl mb-2">Content Management</h1>
        <p className="font-mono text-sm text-muted-foreground">&gt; manage gallery & programs displayed on the landing page</p>

        <div className="flex gap-2 mt-6 border-b border-primary/20">
          {([
            ["gallery", "Gallery", ImageIcon],
            ["programs", "Programs", Trophy],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-sm border-b-2 transition ${
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "gallery" && <GalleryManager />}
          {tab === "programs" && <ProgramsManager />}
        </div>
      </div>
    </div>
  );
}

/* ───────── Gallery ───────── */

function GalleryManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_items").select("*").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({ title: "", description: "", image_url: "", sort_order: 0 });

  const createItem = useMutation({
    mutationFn: async (payload: typeof form) => {
      const { error } = await supabase.from("gallery_items").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Gallery item added");
      setForm({ title: "", description: "", image_url: "", sort_order: 0 });
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      qc.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      qc.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
      <form
        onSubmit={e => { e.preventDefault(); if (!form.title || !form.image_url) return; createItem.mutate(form); }}
        className="glass-card rounded-xl p-5 neon-border space-y-3 h-fit"
      >
        <h3 className="font-display font-bold flex items-center gap-2">
          <Plus size={16} className="text-primary" /> Add Gallery Item
        </h3>
        <Input label="title" value={form.title} onChange={v => setForm({ ...form, title: v })} required />
        <Input label="image_url" value={form.image_url} onChange={v => setForm({ ...form, image_url: v })} required placeholder="https://..." />
        <Textarea label="description" value={form.description} onChange={v => setForm({ ...form, description: v })} />
        <Input label="sort_order" type="number" value={String(form.sort_order)} onChange={v => setForm({ ...form, sort_order: Number(v) || 0 })} />
        <button
          type="submit"
          disabled={createItem.isPending}
          className="w-full py-2 rounded-md bg-primary text-primary-foreground font-mono font-semibold neon-glow disabled:opacity-50"
        >
          {createItem.isPending ? "saving..." : "./save"}
        </button>
        <p className="text-[10px] font-mono text-muted-foreground">
          &gt; tip: paste any public image URL (e.g. from imgur, cloudinary, school site)
        </p>
      </form>

      <div className="space-y-3">
        {isLoading && <Loader2 className="animate-spin text-primary" />}
        {data?.length === 0 && (
          <div className="glass-card rounded-xl p-10 text-center font-mono text-sm text-muted-foreground">
            &gt; no gallery items yet
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          {data?.map(item => (
            <div key={item.id} className="glass-card rounded-lg overflow-hidden neon-border group">
              <div className="aspect-video bg-input overflow-hidden">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-display font-semibold leading-tight">{item.title}</h4>
                  <button
                    onClick={() => { if (confirm("Delete this item?")) deleteItem.mutate(item.id); }}
                    className="text-destructive hover:text-destructive/80"
                    aria-label="delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── Programs ───────── */

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
        <button
          type="submit"
          disabled={create.isPending}
          className="w-full py-2 rounded-md bg-primary text-primary-foreground font-mono font-semibold neon-glow disabled:opacity-50"
        >
          {create.isPending ? "saving..." : "./save"}
        </button>
      </form>

      <div className="space-y-3">
        {isLoading && <Loader2 className="animate-spin text-primary" />}
        {data?.length === 0 && (
          <div className="glass-card rounded-xl p-10 text-center font-mono text-sm text-muted-foreground">
            &gt; no programs yet
          </div>
        )}
        {data?.map(p => (
          <div key={p.id} className="glass-card rounded-lg p-4 neon-border flex items-start gap-4">
            <div className="grid place-items-center h-10 w-10 rounded-md bg-primary/10 border border-primary/30 shrink-0">
              <Trophy size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-semibold">{p.title}</h4>
                <button
                  onClick={() => { if (confirm("Delete this program?")) del.mutate(p.id); }}
                  className="text-destructive hover:text-destructive/80"
                  aria-label="delete"
                >
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

/* ───────── Inputs ───────── */

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
