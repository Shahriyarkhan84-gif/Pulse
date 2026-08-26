import { createClient } from "@supabase/supabase-js";

/**
 * Anon-key client used only to validate a bearer token from a request
 * (supabase.auth.getUser(jwt) round-trips to Supabase Auth to confirm the
 * token is real and unexpired). Holds no session of its own.
 */
export const supabaseAuth = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
  auth: { persistSession: false },
});

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
