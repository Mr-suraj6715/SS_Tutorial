import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

let supabaseClient: SupabaseClient | null = null;
let isSupabaseOnline = false;

export function initSupabase(): SupabaseClient | null {
  const url = config.SUPABASE_URL?.trim();
  const key = config.SUPABASE_KEY?.trim();

  if (!url || !key || url.includes('placeholder-project') || key.includes('placeholder-key')) {
    console.log('[Database] Supabase credentials not set or placeholder — using local SQLite fallback.');
    supabaseClient = null;
    isSupabaseOnline = false;
    return null;
  }

  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('[Database] Initialized Supabase client for:', url);
    return supabaseClient;
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client:', err);
    supabaseClient = null;
    isSupabaseOnline = false;
    return null;
  }
}

export async function checkSupabaseHealth(): Promise<{ online: boolean; url?: string; error?: string }> {
  if (!supabaseClient) {
    return { online: false, error: 'Supabase client not configured. Running on SQLite.' };
  }

  try {
    // Quick probe query to check connectivity
    const { error } = await supabaseClient
      .from('site_settings')
      .select('key', { count: 'exact', head: true });

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, we still know Supabase responded
      if (error.message?.includes('relation') || error.code === '42P01') {
        isSupabaseOnline = true;
        return { online: true, url: config.SUPABASE_URL, error: 'Connected to Supabase, but migrations need to be applied.' };
      }
      isSupabaseOnline = false;
      return { online: false, url: config.SUPABASE_URL, error: error.message };
    }

    isSupabaseOnline = true;
    return { online: true, url: config.SUPABASE_URL };
  } catch (err: any) {
    isSupabaseOnline = false;
    return { online: false, url: config.SUPABASE_URL, error: err.message || 'Connection failed' };
  }
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

export function isUsingSupabase(): boolean {
  return Boolean(supabaseClient && isSupabaseOnline);
}
