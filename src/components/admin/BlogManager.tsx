import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TiptapEditor } from "./TiptapEditor";
import { useSignedUrl, safeFileName } from "@/lib/storage";
import { logAudit } from "@/lib/audit";
import { ExternalLink, FileText, Loader2, Plus, Trash2, Upload, X, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string | null;
  pdf_path: string | null;
  cover_image_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function BlogManager() {
  const qc = useQueryClient();
  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const [editing, setEditing] = useState<BlogPost | "new" | null>(null);

  const del = useMutation({
    mutationFn: async (p: BlogPost) => {
      if (p.pdf_path) await supabase.storage.from("blog").remove([p.pdf_path]);
      const { error } = await supabase.from("blog_posts").delete().eq("id", p.id);
      if (error) throw error;
      void logAudit("blog_delete", { target: p.slug, details: { title: p.title } });
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-blog"] }); qc.invalidateQueries({ queryKey: ["blog-list"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (editing) {
    return <PostEditor post={editing === "new" ? null : editing} onClose={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-blog"] }); qc.invalidateQueries({ queryKey: ["blog-list"] }); }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted-foreground">&gt; tulis write-up atau upload PDF</p>
        <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-mono text-sm font-semibold neon-glow">
          <Plus size={14} /> post baru
        </button>
      </div>

      {isLoading && <Loader2 className="animate-spin text-primary" />}
      {posts?.length === 0 && (
        <div className="glass-card rounded-xl p-10 text-center font-mono text-sm text-muted-foreground">&gt; belum ada post</div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {posts?.map(p => (
          <div key={p.id} className="glass-card rounded-lg p-4 neon-border flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-display font-semibold leading-tight min-w-0 truncate">{p.title}</h4>
              <div className="flex gap-1 shrink-0">
                {p.published ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary px-1.5 py-0.5 rounded bg-primary/10"><Eye size={10} /> live</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/20"><EyeOff size={10} /> draft</span>
                )}
              </div>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">/{p.slug}</div>
            {p.excerpt && <p className="text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>}
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              {p.pdf_path && <span className="inline-flex items-center gap-1 text-primary"><FileText size={10} /> PDF</span>}
              {p.content_html && <span>·</span>}
              {p.content_html && <span>writeup</span>}
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setEditing(p)} className="flex-1 py-1.5 rounded-md border border-primary/30 text-primary font-mono text-xs hover:bg-primary/10">edit</button>
              <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-md border border-primary/30 text-primary font-mono text-xs hover:bg-primary/10 inline-flex items-center gap-1">
                <ExternalLink size={11} />
              </a>
              <button onClick={() => { if (confirm(`Hapus "${p.title}"?`)) del.mutate(p); }} className="px-3 py-1.5 rounded-md border border-destructive/40 text-destructive font-mono text-xs hover:bg-destructive/10">
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostEditor({ post, onClose }: { post: BlogPost | null; onClose: () => void }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [contentHtml, setContentHtml] = useState(post?.content_html ?? "");
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url ?? "");
  const [pdfPath, setPdfPath] = useState(post?.pdf_path ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfValid, setPdfValid] = useState<{ ok: boolean; reason?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const pdfRef = useRef<HTMLInputElement | null>(null);
  const { data: pdfUrl } = useSignedUrl("blog", pdfPath);

  // Local object URL for selected file (thumbnail preview before upload)
  const localPdfUrl = useMemo(() => (pdfFile ? URL.createObjectURL(pdfFile) : null), [pdfFile]);
  useEffect(() => () => { if (localPdfUrl) URL.revokeObjectURL(localPdfUrl); }, [localPdfUrl]);

  const previewUrl = localPdfUrl ?? pdfUrl ?? null;
  const fmtBytes = (n: number) => n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`;

  // PDF magic byte validator (%PDF-) — runs on file pick
  const handlePdfPick = async (f: File | null) => {
    setPdfFile(f);
    setPdfValid(null);
    if (!f) return;
    try {
      if (f.type && f.type !== "application/pdf") {
        setPdfValid({ ok: false, reason: `MIME tidak valid: ${f.type}` }); return;
      }
      if (!/\.pdf$/i.test(f.name)) {
        setPdfValid({ ok: false, reason: "Ekstensi harus .pdf" }); return;
      }
      if (f.size > 20 * 1024 * 1024) {
        setPdfValid({ ok: false, reason: "Ukuran > 20 MB" }); return;
      }
      const head = new Uint8Array(await f.slice(0, 5).arrayBuffer());
      const magic = String.fromCharCode(...head);
      if (!magic.startsWith("%PDF-")) {
        setPdfValid({ ok: false, reason: "Bukan file PDF (magic bytes hilang)" }); return;
      }
      setPdfValid({ ok: true });
    } catch {
      setPdfValid({ ok: false, reason: "Gagal membaca file" });
    }
  };

  const save = async () => {
    if (!title.trim()) return toast.error("Title wajib");
    const finalSlug = (slug || slugify(title)).trim();
    if (!finalSlug) return toast.error("Slug invalid");
    if (!contentHtml.trim() && !pdfFile && !pdfPath) return toast.error("Isi write-up atau upload PDF");
    if (pdfFile && pdfValid && !pdfValid.ok) return toast.error(`PDF tidak valid: ${pdfValid.reason}`);

    setBusy(true);
    try {
      let nextPdf = pdfPath;
      if (pdfFile) {
        const path = `${Date.now()}-${safeFileName(pdfFile.name)}`;
        const { error: upErr } = await supabase.storage.from("blog").upload(path, pdfFile, { contentType: "application/pdf" });
        if (upErr) throw upErr;
        if (pdfPath) await supabase.storage.from("blog").remove([pdfPath]);
        nextPdf = path;
      }

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        content_html: contentHtml.trim() || null,
        cover_image_url: coverUrl.trim() || null,
        pdf_path: nextPdf || null,
        published,
        published_at: published ? (post?.published_at ?? new Date().toISOString()) : null,
      };

      const wasPublished = post?.published ?? false;
      if (post) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", post.id);
        if (error) throw error;
        void logAudit("blog_update", { target: finalSlug, details: { title: payload.title } });
        if (published && !wasPublished) void logAudit("blog_publish", { target: finalSlug });
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
        void logAudit("blog_create", { target: finalSlug, details: { title: payload.title, published } });
        if (published) void logAudit("blog_publish", { target: finalSlug });
      }
      toast.success("Post tersimpan");
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal simpan");
    } finally {
      setBusy(false);
    }
  };

  const removePdf = async () => {
    if (!pdfPath) { setPdfFile(null); setPdfValid(null); return; }
    if (!confirm("Hapus PDF?")) return;
    await supabase.storage.from("blog").remove([pdfPath]);
    setPdfPath("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/90 backdrop-blur border-b border-primary/20">
        <button onClick={onClose} className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground">
          <X size={14} /> cancel
        </button>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-mono cursor-pointer">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="accent-primary" />
            publish
          </label>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-mono text-xs font-semibold neon-glow disabled:opacity-50">
            {busy ? <Loader2 size={12} className="animate-spin" /> : null}
            {busy ? "saving..." : "./save"}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5 neon-border space-y-3">
        <label className="block">
          <span className="font-mono text-[11px] text-primary/80">$ title</span>
          <input value={title} onChange={e => { setTitle(e.target.value); if (!post && !slug) setSlug(slugify(e.target.value)); }} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-base focus:outline-none focus:ring-2 focus:ring-primary/60" />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] text-primary/80">$ slug (URL)</span>
          <input value={slug} onChange={e => setSlug(slugify(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60" />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] text-primary/80">$ excerpt</span>
          <textarea value={excerpt} rows={2} onChange={e => setExcerpt(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 resize-y" />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] text-primary/80">$ cover_image_url (opsional)</span>
          <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60" />
        </label>
      </div>

      <div className="glass-card rounded-xl p-5 neon-border space-y-2">
        <h3 className="font-display font-bold tracking-widest text-primary text-sm">// WRITE-UP</h3>
        <TiptapEditor value={contentHtml} onChange={setContentHtml} />
      </div>

      <div className="glass-card rounded-xl p-5 neon-border space-y-3">
        <h3 className="font-display font-bold tracking-widest text-primary text-sm">// PDF ATTACHMENT</h3>
        <input ref={pdfRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => handlePdfPick(e.target.files?.[0] ?? null)} />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => pdfRef.current?.click()} className="px-4 py-2 rounded-md border border-dashed border-primary/40 font-mono text-xs text-primary hover:bg-primary/5 inline-flex items-center gap-2">
            <Upload size={14} /> {pdfFile ? pdfFile.name : (pdfPath ? "ganti PDF" : "pilih PDF")}
          </button>
          {(pdfFile || pdfPath) && (
            <button type="button" onClick={removePdf} className="text-destructive hover:text-destructive/80 inline-flex items-center gap-1 text-xs font-mono">
              <Trash2 size={12} /> hapus
            </button>
          )}
          {pdfPath && pdfUrl && !pdfFile && (
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-mono ml-auto">
              <ExternalLink size={12} /> buka tab
            </a>
          )}
        </div>

        {pdfFile && (
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
            <span className="text-muted-foreground">{fmtBytes(pdfFile.size)}</span>
            {pdfValid?.ok ? (
              <span className="inline-flex items-center gap-1 text-primary"><CheckCircle2 size={12} /> valid PDF</span>
            ) : pdfValid && !pdfValid.ok ? (
              <span className="inline-flex items-center gap-1 text-destructive"><AlertCircle size={12} /> {pdfValid.reason}</span>
            ) : (
              <span className="text-muted-foreground inline-flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> validating...</span>
            )}
          </div>
        )}

        {previewUrl && (!pdfFile || pdfValid?.ok) && (
          <div className="rounded-md overflow-hidden border border-primary/20 bg-background">
            <div className="px-3 py-2 border-b border-primary/10 flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground">&gt; pratinjau halaman pertama</span>
              <a href={previewUrl} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-primary inline-flex items-center gap-1">
                <ExternalLink size={10} /> fullscreen
              </a>
            </div>
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
              title="PDF preview"
              className="w-full h-[420px] bg-background"
            />
          </div>
        )}

        <p className="text-[10px] font-mono text-muted-foreground">
          PDF maks 20 MB · validasi: magic bytes %PDF-, MIME, ekstensi. Pratinjau dirender oleh browser.
        </p>
      </div>
    </div>
  );
}

