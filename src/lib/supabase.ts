import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(rawUrl: string) {
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, "");
}

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
export const isSupabaseConfigured = Boolean(supabaseUrl && publishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export async function getSupabaseUser() {
  if (!supabase) return null;
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export function getAuthRedirectUrl() {
  if (typeof window === "undefined") return undefined;
  return new URL(import.meta.env.BASE_URL || "/", window.location.origin).toString();
}
