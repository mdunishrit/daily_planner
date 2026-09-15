import { createClient, SupabaseClient } from "@supabase/supabase-js";

/** Server-side Supabase client. Returns null when env vars are missing. */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false }, global: { fetch: fetchWithRetry } });
}

/** Retries a request when the TCP connect fails or stalls. Works around flaky ISP routes. */
async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await fetch(input, { ...init, signal: AbortSignal.timeout(4000) });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export function requireSupabase(): SupabaseClient {
  const client = getSupabase();
  if (!client) throw new Error("Supabase not configured. Add .env.local");
  return client;
}
