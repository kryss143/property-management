import { config as dotenvConfig } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

// Load environment variables from a single .env file.
// NODE_ENV decides which Supabase project / origin pair to use:
//   - "production"            -> SUPABASE_URL / SUPABASE_*_KEY / FRONTEND_ORIGIN
//   - anything else (default) -> SUPABASE_LOCAL_URL / SUPABASE_LOCAL_*_KEY / FRONTEND_LOCAL_ORIGIN
const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

const backendRoot = resolve(__dirname, "..");

const envPaths = [resolve(backendRoot, ".env"), resolve(process.cwd(), ".env")];

for (const path of [...new Set(envPaths)]) {
  if (existsSync(path)) {
    dotenvConfig({ path });
    break; // first match wins, no need to keep scanning
  }
}

// Pick the right pair of keys depending on environment.
const supabaseUrl = isProduction
  ? process.env.SUPABASE_URL
  : process.env.SUPABASE_LOCAL_URL;

const supabaseAnonKey = isProduction
  ? process.env.SUPABASE_ANON_KEY
  : process.env.SUPABASE_LOCAL_ANON_KEY;

const supabaseServiceRoleKey = isProduction
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;

const frontendOrigin = isProduction
  ? process.env.FRONTEND_ORIGIN
  : process.env.FRONTEND_LOCAL_ORIGIN;

const required: Record<string, string | undefined> = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseAnonKey,
  SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
};

for (const [key, value] of Object.entries(required)) {
  if (!value) {
    console.warn(
      `[config] Missing ${key} for ${isProduction ? "production" : "local"} environment. ` +
        "Supabase routes will fail until it is configured.",
    );
  }
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: frontendOrigin ?? "http://localhost:5173",
  supabaseUrl: supabaseUrl ?? "",
  supabaseAnonKey: supabaseAnonKey ?? "",
  supabaseServiceRoleKey: supabaseServiceRoleKey ?? "",
};

if (!isProduction) {
  console.log(`[config] Using Supabase project (${env}):`, config.supabaseUrl);
}
