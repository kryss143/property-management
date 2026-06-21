import { createClient } from "@supabase/supabase-js";

const isDev = Boolean(import.meta.env.DEV);

// Single fused .env file now holds both local and production credentials.
// Pick the right pair based on dev vs. production build, the same way the
// backend config.ts splits SUPABASE_* vs SUPABASE_LOCAL_*.
const supabaseUrl = isDev
  ? import.meta.env.VITE_LOCAL_SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = isDev
  ? import.meta.env.VITE_LOCAL_SUPABASE_ANON_KEY
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

if (isDev) {
  console.log(
    "[env] MODE:",
    import.meta.env.MODE,
    "DEV:",
    isDev,
    "-> using LOCAL Supabase project",
  );
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    `[supabase] Missing ${isDev ? "VITE_LOCAL_SUPABASE_URL/VITE_LOCAL_SUPABASE_ANON_KEY" : "VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY"}. ` +
      "Supabase calls will fail until these are configured.",
  );
}

// Use sessionStorage so auth sessions expire when the browser tab/window is closed.
// sessionStorage is cleared when the tab is closed, which prevents persistent
// login across browser sessions while keeping normal behavior within the tab.
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
