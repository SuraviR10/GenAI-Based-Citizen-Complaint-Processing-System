import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '');
export const supabaseAnonKey = rawAnonKey.trim().replace(/^["']|["']$/g, '');

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your_supabase_anon_key') &&
    !supabaseAnonKey.includes('placeholder')
  );
};

export const getSupabaseConfigState = () => {
  const configured = isSupabaseConfigured();
  return {
    configured,
    url: configured ? supabaseUrl : null,
    hasKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes('placeholder')),
    mode: configured ? ('supabase_live' as const) : ('local_preview' as const)
  };
};

// Fallback dummy client if credentials are not configured yet to prevent immediate runtime crash
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
