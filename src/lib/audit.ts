import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "login"
  | "login_failed"
  | "logout"
  | "password_change"
  | "mfa_enabled"
  | "mfa_disabled"
  | "logo_change"
  | "logo_reset"
  | "gallery_upload"
  | "gallery_delete"
  | "blog_create"
  | "blog_update"
  | "blog_publish"
  | "blog_delete"
  | "site_content_update";

export async function logAudit(
  action: AuditAction,
  opts: { target?: string; details?: Record<string, unknown> } = {},
) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    await supabase.from("audit_logs").insert({
      user_id: user?.id ?? null,
      actor_email: user?.email ?? null,
      action,
      target: opts.target ?? null,
      details: (opts.details ?? {}) as never,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    });
  } catch (e) {
    // Never block UX on audit failure
    console.warn("[audit]", action, e);
  }
}
