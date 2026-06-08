import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/basnion-logo.png.asset.json";
import { MatrixRain } from "@/components/MatrixRain";
import { toast } from "sonner";
import { Lock, Mail, Loader2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/Hosu35Hioasss/")({
  head: () => ({
    meta: [
      { title: "Admin Access — Basnion" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
        if (roles?.some(r => r.role === "admin")) {
          navigate({ to: "/Hosu35Hioasss/dashboard" });
          return;
        }
      }
      setChecking(false);
    })();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      if (!roles?.some(r => r.role === "admin")) {
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin role required.");
      }
      toast.success("Authentication successful");
      navigate({ to: "/Hosu35Hioasss/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen grid place-items-center bg-background overflow-hidden px-4">
      <MatrixRain className="absolute inset-0 w-full h-full opacity-25" />
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 neon-border">
          <div className="flex flex-col items-center text-center mb-6">
            <img src={logoAsset.url} alt="Basnion" className="h-16 w-16 mb-3 animate-pulse-neon rounded-lg" />
            <div className="font-mono text-xs text-primary flex items-center gap-2">
              <ShieldAlert size={14} /> ADMIN ACCESS TERMINAL
            </div>
            <h1 className="font-display font-black text-2xl mt-2">SECURE LOGIN</h1>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              &gt; authorized personnel only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-xs text-primary/80">$ email</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
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
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3 py-2.5 rounded-md bg-input border border-primary/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-md bg-primary text-primary-foreground font-mono font-semibold neon-glow hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-transform inline-flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {loading ? "authenticating..." : "./authenticate"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-primary/15 font-mono text-[10px] text-muted-foreground text-center">
            &gt; session_id: {Math.random().toString(36).slice(2, 10)} · all attempts logged
          </div>
        </div>
      </div>
    </div>
  );
}
