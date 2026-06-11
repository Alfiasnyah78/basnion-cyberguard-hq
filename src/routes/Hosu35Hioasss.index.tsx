import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/BrandLogo";
import { MatrixRain } from "@/components/MatrixRain";
import { toast } from "sonner";
import { Lock, Mail, Loader2, ShieldAlert, Smartphone } from "lucide-react";

export const Route = createFileRoute("/Hosu35Hioasss/")({
  head: () => ({
    meta: [
      { title: "Admin Access — Basnion" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

type Stage = "credentials" | "mfa";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [stage, setStage] = useState<Stage>("credentials");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const finishLogin = async (userId: string) => {
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (!roles?.some(r => r.role === "admin")) {
      await supabase.auth.signOut();
      throw new Error("Akses ditolak. Role admin diperlukan.");
    }
    toast.success("Authentication successful");
    navigate({ to: "/Hosu35Hioasss/dashboard" });
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
          // Need to challenge MFA
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const totp = factors?.totp?.find(f => f.status === "verified");
          if (totp) {
            const { data: ch } = await supabase.auth.mfa.challenge({ factorId: totp.id });
            setFactorId(totp.id);
            setChallengeId(ch?.id ?? null);
            setStage("mfa");
            setChecking(false);
            return;
          }
        }
        try { await finishLogin(session.user.id); return; } catch { /* fall through */ }
      }
      setChecking(false);
    })();
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === "aal2") {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totp = factors?.totp?.find(f => f.status === "verified");
        if (totp) {
          const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
          if (chErr) throw chErr;
          setFactorId(totp.id);
          setChallengeId(ch.id);
          setStage("mfa");
          setLoading(false);
          return;
        }
      }
      await finishLogin(data.user.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const submitMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || !challengeId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: mfaCode.trim() });
      if (error) throw error;
      await finishLogin(data.user.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kode salah");
      setMfaCode("");
    } finally {
      setLoading(false);
    }
  };

  const cancelMfa = async () => {
    await supabase.auth.signOut();
    setStage("credentials");
    setMfaCode("");
    setFactorId(null);
    setChallengeId(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen grid place-items-center bg-background overflow-hidden px-4 py-8">
      <MatrixRain className="absolute inset-0 w-full h-full opacity-25" />
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="glass-card rounded-2xl p-6 sm:p-8 neon-border">
          <div className="flex flex-col items-center text-center mb-6">
            <BrandLogo className="h-16 w-16 mb-3 animate-pulse-neon rounded-lg" alt="Basnion" />
            <div className="font-mono text-xs text-primary flex items-center gap-2">
              <ShieldAlert size={14} /> ADMIN ACCESS TERMINAL
            </div>
            <h1 className="font-display font-black text-2xl mt-2">
              {stage === "credentials" ? "SECURE LOGIN" : "2FA REQUIRED"}
            </h1>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              &gt; {stage === "credentials" ? "authorized personnel only" : "input code from authenticator"}
            </p>
          </div>

          {stage === "credentials" ? (
            <form onSubmit={submitCredentials} className="space-y-4">
              <div>
                <label className="font-mono text-xs text-primary/80">$ email</label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" />
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
                    className="w-full pl-10 pr-3 py-2.5 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
                    placeholder="admin@harbas.onion.com"
                  />
                </div>
              </div>
              <div>
                <label className="font-mono text-xs text-primary/80">$ password</label>
                <div className="relative mt-1">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" />
                  <input
                    type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full mt-2 py-2.5 rounded-md bg-primary text-primary-foreground font-mono font-semibold neon-glow hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-transform inline-flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                {loading ? "authenticating..." : "./authenticate"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitMfa} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-primary justify-center">
                <Smartphone size={14} /> Authenticator code
              </div>
              <input
                autoFocus inputMode="numeric" maxLength={6} required
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full px-3 py-3 rounded-md bg-input border border-primary/30 font-mono tracking-[0.5em] text-center text-xl focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <button type="submit" disabled={loading || mfaCode.length !== 6} className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-mono font-semibold neon-glow disabled:opacity-50 inline-flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
                {loading ? "verifying..." : "./verify"}
              </button>
              <button type="button" onClick={cancelMfa} className="w-full py-2 rounded-md border border-primary/30 text-muted-foreground font-mono text-xs hover:text-foreground">
                cancel
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-primary/15 font-mono text-[10px] text-muted-foreground text-center">
            &gt; session_id: {Math.random().toString(36).slice(2, 10)} · all attempts logged
          </div>
        </div>
      </div>
    </div>
  );
}
