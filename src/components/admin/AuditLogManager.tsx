import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ScrollText, Filter, RefreshCw } from "lucide-react";

type AuditRow = {
  id: string;
  created_at: string;
  actor_email: string | null;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  user_agent: string | null;
};

const ACTIONS = [
  "all", "login", "login_failed", "logout", "password_change",
  "mfa_enabled", "mfa_disabled", "logo_change", "logo_reset",
  "gallery_upload", "gallery_delete", "blog_create", "blog_update",
  "blog_publish", "blog_delete", "site_content_update",
];

const actionColor = (a: string) => {
  if (a.includes("failed") || a.includes("delete")) return "text-destructive border-destructive/40 bg-destructive/10";
  if (a.includes("login") || a.includes("mfa_enabled") || a.includes("publish")) return "text-primary border-primary/40 bg-primary/10";
  return "text-muted-foreground border-primary/20 bg-muted/20";
};

export function AuditLogManager() {
  const [filter, setFilter] = useState<string>("all");
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-audit-logs", filter],
    queryFn: async () => {
      let q = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (filter !== "all") q = q.eq("action", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as AuditRow[];
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div className="flex items-start gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-md bg-primary/10 border border-primary/30 shrink-0">
            <ScrollText size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold">Audit Log</h3>
            <p className="text-xs text-muted-foreground font-mono mt-1">&gt; 200 aktivitas terakhir admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/60" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-7 pr-3 py-1.5 rounded-md bg-input border border-primary/30 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/60 w-full"
            >
              {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button onClick={() => refetch()} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-primary/30 text-primary font-mono text-xs hover:bg-primary/10">
            <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} /> refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin text-primary" />
      ) : data?.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center font-mono text-sm text-muted-foreground">&gt; belum ada aktivitas</div>
      ) : (
        <div className="glass-card rounded-xl neon-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-primary/20 bg-primary/5 text-primary/80">
                  <th className="text-left p-3 font-semibold">timestamp</th>
                  <th className="text-left p-3 font-semibold">action</th>
                  <th className="text-left p-3 font-semibold">actor</th>
                  <th className="text-left p-3 font-semibold">target</th>
                  <th className="text-left p-3 font-semibold">details</th>
                </tr>
              </thead>
              <tbody>
                {data?.map(row => (
                  <tr key={row.id} className="border-b border-primary/10 hover:bg-primary/5">
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {new Date(row.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "medium" })}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] ${actionColor(row.action)}`}>
                        {row.action}
                      </span>
                    </td>
                    <td className="p-3 truncate max-w-[180px]">{row.actor_email ?? <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3 truncate max-w-[200px] text-muted-foreground">{row.target ?? "—"}</td>
                    <td className="p-3 max-w-[280px]">
                      {row.details && Object.keys(row.details).length > 0 ? (
                        <code className="text-[10px] text-primary/70 break-all line-clamp-2">{JSON.stringify(row.details)}</code>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
