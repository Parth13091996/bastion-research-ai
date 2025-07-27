import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ftuuyfhfrhvlllfwfbjx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dXV5Zmhmcmh2bGxsZndmYmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTMwMjMsImV4cCI6MjA2NzE4OTAyM30.DjPNTo6axhUCEJC4MJ8j8NKdZHNP8kpub-KbceiUePk";


export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
