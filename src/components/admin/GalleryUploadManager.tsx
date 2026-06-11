import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSignedUrl, safeFileName } from "@/lib/storage";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

export function GalleryUploadManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_items").select("*").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({ title: "", description: "", sort_order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !file) return toast.error("Title dan gambar wajib");
    if (!ALLOWED.includes(file.type)) return toast.error("Format: PNG/JPG/WEBP/GIF");
    if (file.size > MAX_BYTES) return toast.error("Maks 5 MB");

    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${Date.now()}-${safeFileName(form.title)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("gallery").upload(path, file, {
        contentType: file.type, cacheControl: "3600",
      });
      if (upErr) throw upErr;
      const { error: dbErr } = await supabase.from("gallery_items").insert({
        title: form.title, description: form.description, image_url: path, sort_order: form.sort_order,
      });
      if (dbErr) throw dbErr;
      toast.success("Gallery item ditambahkan");
      setForm({ title: "", description: "", sort_order: 0 });
      setFile(null);
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      qc.invalidateQueries({ queryKey: ["gallery"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(false);
    }
  };

  const del = useMutation({
    mutationFn: async (item: { id: string; image_url: string }) => {
      if (item.image_url && !/^https?:\/\//i.test(item.image_url)) {
        await supabase.storage.from("gallery").remove([item.image_url]);
      }
      const { error } = await supabase.from("gallery_items").delete().eq("id", item.id);
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
      <form onSubmit={submit} className="glass-card rounded-xl p-5 neon-border space-y-3 h-fit">
        <h3 className="font-display font-bold flex items-center gap-2">
          <Plus size={16} className="text-primary" /> Upload Gallery
        </h3>
        <label className="block">
          <span className="font-mono text-[11px] text-primary/80">$ title</span>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60" />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] text-primary/80">$ description</span>
          <textarea value={form.description} rows={2} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 resize-y" />
        </label>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
        />
        <button type="button" onClick={() => inputRef.current?.click()} className="w-full py-2 rounded-md border border-dashed border-primary/40 font-mono text-xs text-primary hover:bg-primary/5 inline-flex items-center justify-center gap-2">
          <Upload size={14} /> {file ? file.name : "pilih_gambar"}
        </button>
        {file && (
          <div className="aspect-video rounded-md overflow-hidden border border-primary/20">
            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}
        <label className="block">
          <span className="font-mono text-[11px] text-primary/80">$ sort_order</span>
          <input type="number" value={String(form.sort_order)} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60" />
        </label>
        <button type="submit" disabled={busy} className="w-full py-2 rounded-md bg-primary text-primary-foreground font-mono font-semibold neon-glow disabled:opacity-50 inline-flex items-center justify-center gap-2">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {busy ? "uploading..." : "./upload"}
        </button>
      </form>

      <div className="space-y-3">
        {isLoading && <Loader2 className="animate-spin text-primary" />}
        {data?.length === 0 && (
          <div className="glass-card rounded-xl p-10 text-center font-mono text-sm text-muted-foreground">&gt; belum ada gallery</div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          {data?.map(item => (
            <GalleryCard key={item.id} item={item} onDelete={() => { if (confirm("Hapus item ini?")) del.mutate({ id: item.id, image_url: item.image_url }); }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryCard({ item, onDelete }: { item: { id: string; title: string; description: string | null; image_url: string }; onDelete: () => void }) {
  const { data: url } = useSignedUrl("gallery", item.image_url);
  const src = /^https?:\/\//i.test(item.image_url) ? item.image_url : url;
  return (
    <div className="glass-card rounded-lg overflow-hidden neon-border">
      <div className="aspect-video bg-input overflow-hidden">
        {src ? <img src={src} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center"><Loader2 className="animate-spin text-primary" size={16} /></div>}
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display font-semibold leading-tight truncate">{item.title}</h4>
          <button onClick={onDelete} className="text-destructive hover:text-destructive/80 shrink-0" aria-label="delete">
            <Trash2 size={14} />
          </button>
        </div>
        {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
      </div>
    </div>
  );
}
