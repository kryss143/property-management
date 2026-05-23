import { config as dotenvConfig } from "dotenv";
import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
const env = process.env.NODE_ENV || "development";
const envFile = env === "production" ? ".env.production" : ".env.local";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendRoot = resolve(__dirname, "..");

const envPaths = [
  resolve(backendRoot, envFile),
  resolve(process.cwd(), envFile),
  resolve(backendRoot, ".env"),
  resolve(process.cwd(), ".env"),
];

for (const path of [...new Set(envPaths)]) {
  if (existsSync(path)) {
    dotenvConfig({ path });
  }
}

const required = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.warn(
      `[config] Missing ${key}. Supabase routes will fail until it is configured.`,
    );
  }
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};
