/**
 * Supabase client stub — optional env. App works fully on localStorage
 * until NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}

/** Placeholder sync — no-ops until Supabase is wired. */
export async function syncProgressStub(_payload: unknown): Promise<{ ok: boolean; stub: true }> {
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, stub: true };
  }
  // Future: upsert into learner_progress
  return { ok: true, stub: true };
}
