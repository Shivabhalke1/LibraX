import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://clzluhnbctyifdmgocgs.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_1ArU5WGyXcw-jJWan5_zww_J6Ix_kxW';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-public-key'
);

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

