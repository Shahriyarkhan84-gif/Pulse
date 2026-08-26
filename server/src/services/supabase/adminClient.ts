import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses row-level security. Only ever used for
 * writes the backend itself performs (e.g. inserting a stream row once a
 * LiveKit room has actually been created). Never expose this key to the app.
 */
export const supabaseAdmin = createClient(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } },
);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
