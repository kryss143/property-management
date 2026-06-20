import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseMode = import.meta.env.MODE;
const isDev = Boolean(import.meta.env.DEV);

console.log("[env] MODE:", supabaseMode, "DEV:", isDev);

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// Use sessionStorage so auth sessions expire when the browser tab/window is closed.
// sessionStorage is cleared when the tab is closed, which prevents persistent
// login across browser sessions while keeping normal behavior within the tab.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
