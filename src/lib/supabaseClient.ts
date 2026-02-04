import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Debug: Check if env vars are loaded
console.log('Supabase URL:', supabaseUrl ? 'Loaded ✓' : 'MISSING ✗');
console.log('Supabase Key:', supabaseAnonKey ? 'Loaded ✓' : 'MISSING ✗');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create single instance
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'love-journal-app',
      },
    },
  }
);
