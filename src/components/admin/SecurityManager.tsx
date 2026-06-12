import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QRCode from "qrcode";
import { logAudit } from "@/lib/audit";
import { ShieldCheck, ShieldAlert, KeyRound, Loader2, Trash2, Smartphone, Check } from "lucide-react";

export function SecurityManager() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <TwoFactorPanel />
      <PasswordPanel />
    </div>
  );
}

/* ─────────── 2FA / TOTP ─────────── */

function TwoFactorPanel() {
  const qc = useQueryClient();
  const { data: factors, isLoading } = useQuery({
    queryKey: ["mfa-factors"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      return data.totp ?? [];
    },
  });

  const verified = factors?.filter(f => f.status === "verified") ?? [];
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const startEnroll = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
      });
      if (error) throw error;
      const qr = await QRCode.toDataURL(data.totp.uri, { width: 220, margin: 1 });
      setEnrolling({ id: data.id, qr, secret: data.totp.secret });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enroll failed");
    } finally {
      setBusy(false);
    }
  };

  const cancelEnroll = async () => {
    if (!enrolling) return;
    await supabase.auth.mfa.unenroll({ factorId: enrolling.id });
    setEnrolling(null);
    setCode("");
    qc.invalidateQueries({ queryKey: ["mfa-factors"] });
  };

  const verifyEnroll = async () => {
    if (!enrolling) return;
    setBusy(true);
    try {
      const { data: ch, error: e1 } = await supabase.auth.mfa.challenge({ factorId: enrolling.id });
      if (e1) throw e1;
      const { error: e2 } = await supabase.auth.mfa.verify({
        factorId: enrolling.id,
        challengeId: ch.id,
        code: code.trim(),
      });
      if (e2) throw e2;
      toast.success("2FA aktif");
      void logAudit("mfa_enabled", { target: enrolling.id });
      setEnrolling(null);
      setCode("");
      qc.invalidateQueries({ queryKey: ["mfa-factors"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verifikasi gagal");
    } finally {
      setBusy(false);
    }
  };

  const removeFactor = async (factorId: string) => {
    if (!confirm("Nonaktifkan 2FA?")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) return toast.error(error.message);
    toast.success("2FA dinonaktifkan");
    void logAudit("mfa_disabled", { target: factorId });
    qc.invalidateQueries({ queryKey: ["mfa-factors"] });
  };

  return (
    <div className="glass-card rounded-xl p-5 neon-border space-y-4">
      <div className="flex items-start gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-md bg-primary/10 border border-primary/30 shrink-0">
          <Smartphone size={18} className="text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display font-bold">2FA — Authenticator App</h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            &gt; Google Authenticator / Authy / 1Password — kode 6 digit setiap login
          </p>
        </div>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin text-primary" />
      ) : verified.length > 0 && !enrolling ? (
        <div className="space-y-2">
          {verified.map(f => (
            <div key={f.id} className="flex items-center justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck size={16} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-mono truncate">{f.friendly_name ?? "TOTP"}</div>
                  <div className="text-[10px] text-muted-foreground">aktif sejak {new Date(f.created_at).toLocaleDateString("id-ID")}</div>
                </div>
              </div>
              <button onClick={() => removeFactor(f.id)} className="text-destructive hover:text-destructive/80 shrink-0" aria-label="remove">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : enrolling ? (
        <div className="space-y-3">
          <div className="rounded-md border border-primary/30 bg-background p-3 flex flex-col sm:flex-row items-center gap-4">
            <img src={enrolling.qr} alt="QR" className="rounded-md bg-white p-1" />
            <div className="min-w-0 space-y-2 text-center sm:text-left">
              <p className="text-xs font-mono text-muted-foreground">scan dengan Google Authenticator, lalu input 6 digit:</p>
              <div className="text-[10px] font-mono break-all text-primary/70">secret: {enrolling.secret}</div>
            </div>
          </div>
          <input
            autoFocus
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono tracking-[0.4em] text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
          <div className="flex gap-2">
            <button onClick={verifyEnroll} disabled={busy || code.length !== 6} className="flex-1 py-2 rounded-md bg-primary text-primary-foreground font-mono text-sm font-semibold neon-glow disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} verify
            </button>
            <button onClick={cancelEnroll} className="px-4 py-2 rounded-md border border-primary/30 font-mono text-sm text-muted-foreground hover:text-foreground">cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <ShieldAlert size={14} className="text-yellow-500" /> 2FA belum aktif — sangat direkomendasikan
          </div>
          <button onClick={startEnroll} disabled={busy} className="w-full py-2 rounded-md bg-primary text-primary-foreground font-mono text-sm font-semibold neon-glow disabled:opacity-50 inline-flex items-center justify-center gap-2">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Smartphone size={14} />} aktifkan 2FA
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────── Password change ─────────── */

function PasswordPanel() {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 12) return toast.error("Password minimal 12 karakter");
    if (!/[A-Z]/.test(newPw) || !/[a-z]/.test(newPw) || !/\d/.test(newPw))
      return toast.error("Harus mengandung huruf besar, kecil, dan angka");
    if (newPw !== confirm) return toast.error("Konfirmasi tidak cocok");

    setBusy(true);
    try {
      // Re-authenticate to verify old password before changing
      const { error: reauth } = await supabase.auth.signInWithPassword({ email, password: oldPw });
      if (reauth) throw new Error("Password lama salah");

      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      toast.success("Password berhasil diganti");
      void logAudit("password_change");
      setOldPw(""); setNewPw(""); setConfirm("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass-card rounded-xl p-5 neon-border space-y-3">
      <div className="flex items-start gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-md bg-primary/10 border border-primary/30 shrink-0">
          <KeyRound size={18} className="text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display font-bold">Ganti Password</h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">&gt; min 12 char, kombinasi huruf besar/kecil + angka</p>
        </div>
      </div>
      <PwField label="password lama" value={oldPw} onChange={setOldPw} />
      <PwField label="password baru" value={newPw} onChange={setNewPw} />
      <PwField label="konfirmasi password baru" value={confirm} onChange={setConfirm} />
      <button type="submit" disabled={busy || !oldPw || !newPw || !confirm} className="w-full py-2 rounded-md bg-primary text-primary-foreground font-mono text-sm font-semibold neon-glow disabled:opacity-50 inline-flex items-center justify-center gap-2">
        {busy ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />} ./update_password
      </button>
    </form>
  );
}

function PwField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] text-primary/80">$ {label}</span>
      <input
        type="password"
        autoComplete="new-password"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
      />
    </label>
  );
}
