import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ONE_HOUR = 3600;

/**
 * Resolves a stored image reference to a usable URL.
 * - Returns http(s) URLs as-is (legacy gallery items, external)
 * - Returns null/empty as null
 * - Generates a signed URL for storage paths
 */
export async function resolveStorageUrl(
  bucket: string,
  value: string | null | undefined,
  expiresIn = ONE_HOUR,
): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(value, expiresIn);
  if (error) {
    console.warn(`[storage] sign failed for ${bucket}/${value}:`, error.message);
    return null;
  }
  return data.signedUrl;
}

export function useSignedUrl(bucket: string, path: string | null | undefined, expiresIn = ONE_HOUR) {
  return useQuery({
    queryKey: ["signed-url", bucket, path, expiresIn],
    queryFn: () => resolveStorageUrl(bucket, path, expiresIn),
    enabled: !!path,
    staleTime: (expiresIn - 60) * 1000,
    gcTime: expiresIn * 1000,
  });
}

export const LOGO_BUCKET = "branding";
export const LOGO_PATH_KEY = "logo_path";

export function useLogoUrl() {
  const { data: setting } = useQuery({
    queryKey: ["site_setting", LOGO_PATH_KEY],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", LOGO_PATH_KEY)
        .maybeSingle();
      return (data?.value as { path?: string } | null)?.path ?? null;
    },
  });
  const { data: url } = useSignedUrl(LOGO_BUCKET, setting, 60 * 60 * 24);
  return url;
}

export function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
}
