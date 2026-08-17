import { createClient, SupabaseClient } from '@supabase/supabase-js';

let envLoaded = false;

interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

function loadEnv(): void {
  // On Vercel, environment variables are set directly
  // No need to load from Python script or dotenv
  envLoaded = true;
}

function getSupabaseCredentials(): SupabaseCredentials {
  loadEnv();

  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase credentials. Please set COZE_SUPABASE_URL and COZE_SUPABASE_ANON_KEY environment variables.'
    );
  }

  return { url, anonKey };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const { url, anonKey } = getSupabaseCredentials();
    supabaseInstance = createClient(url, anonKey);
  }
  return supabaseInstance;
}

export function getSupabaseServiceRole(): SupabaseClient {
  loadEnv();

  const url = process.env.COZE_SUPABASE_URL;
  const serviceRoleKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase service role credentials. Please set COZE_SUPABASE_URL and COZE_SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }

  return createClient(url, serviceRoleKey);
}

export type { SupabaseClient };
