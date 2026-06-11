import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LOGO_BUCKET, LOGO_PATH_KEY, useLogoUrl, safeFileName } from "@/lib/storage";
import logoAsset from "@/assets/basnion-logo.png.asset.json";
import { ImagePlus, Loader2, RotateCcw, Upload } from "lucide-react";

const ALLOWED = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export function LogoManager() {
  const qc = useQueryClient();
  const url = useLogoUrl();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onFile = async (file: File) => {
    if (!ALLOWED.includes(file.type)) return toast.error("Format: PNG/JPG/SVG/WEBP");
    if (file.size > MAX_BYTES) return toast.error("Maks 2 MB");

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `logo-${Date.now()}.${safeFileName(ext)}`;
      const { error: upErr } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, {
        upsert: true, contentType: file.type, cacheControl: "3600",
      });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase.from("site_settings").upsert({
        key: LOGO_PATH_KEY, value: { path } as never,
      });
      if (dbErr) throw dbErr;

      toast.success("Logo diperbarui — langsung tampil di website");
      qc.invalidateQueries({ queryKey: ["site_setting", LOGO_PATH_KEY] });
      qc.invalidateQueries({ queryKey: ["signed-url", LOGO_BUCKET] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  const reset = async () => {
    if (!confirm("Reset ke logo default?")) return;
    const { error } = await supabase.from("site_settings").delete().eq("key", LOGO_PATH_KEY);
    if (error) return toast.error(error.message);
    toast.success("Logo direset ke default");
    qc.invalidateQueries({ queryKey: ["site_setting", LOGO_PATH_KEY] });
  };

  return (
    <div className="glass-card rounded-xl p-5 neon-border space-y-4 max-w-2xl">
      <div className="flex items-start gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-md bg-primary/10 border border-primary/30 shrink-0">
          <ImagePlus size={18} className="text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display font-bold">Logo Website</h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">&gt; upload PNG/JPG/SVG — langsung berubah di seluruh website</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-[160px_1fr] gap-4 items-center">
        <div className="aspect-square rounded-lg border border-primary/30 bg-background grid place-items-center p-4">
          <img src={url ?? logoAsset.url} alt="current logo" className="max-w-full max-h-full object-contain" />
        </div>
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-mono text-sm font-semibold neon-glow disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "uploading..." : "./pilih_file"}
          </button>
          <button
            onClick={reset}
            disabled={uploading || !url}
            className="w-full py-2 rounded-md border border-primary/30 text-primary font-mono text-xs hover:bg-primary/10 disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            <RotateCcw size={12} /> reset ke default
          </button>
          <p className="text-[10px] font-mono text-muted-foreground">PNG/JPG/SVG/WEBP · maks 2 MB · rasio kotak (1:1) terbaik</p>
        </div>
      </div>
    </div>
  );
}
