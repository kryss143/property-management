import cors from "cors";
import express from "express";
import type { ErrorRequestHandler } from "express";
import morgan from "morgan";
import { config } from "./config.js";
import { crudRouters } from "./routes/crud.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { profileRouter } from "./routes/profile.js";

const app = express();

// Disable Express's automatic ETag generation. Without this, GET requests
// for dynamic, frequently-changing resources (tenants, properties, etc.)
// can come back as 304 Not Modified against a stale cached body, even
// when the underlying data has changed.
app.disable("etag");

// Belt-and-suspenders: explicitly tell the browser (and any proxy/CDN in
// front of this API) never to cache responses, rather than relying on the
// ETag setting alone to prevent conditional-GET / 304 staleness.
app.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(cors({ origin: config.frontendOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api", (_req, res) => {
  res.json({
    name: "Property Management API",
    status: "ok",
    endpoints: [
      "/api/profile",
      "/api/dashboard",
      "/api/properties",
      "/api/units",
      "/api/tenants",
      "/api/leases",
      "/api/payments",
      "/api/maintenance-requests",
    ],
  });
});

app.use("/api/profile", profileRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/properties", crudRouters.properties);
app.use("/api/units", crudRouters.units);
app.use("/api/tenants", crudRouters.tenants);
app.use("/api/leases", crudRouters.leases);
app.use("/api/payments", crudRouters.payments);
app.use("/api/maintenance-requests", crudRouters.maintenanceRequests);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Supabase errors carry a `status` and `code` alongside a `message`.
// This interface covers both the PostgREST shape and the Auth shape.
interface SupabaseError {
  message: string;
  status?: number; // PostgREST / Auth HTTP status
  code?: string; // e.g. "PGRST116", "invalid_credentials"
  details?: string; // PostgREST detail string
  hint?: string; // PostgREST hint string
}

function isSupabaseError(err: unknown): err is SupabaseError {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    // At least one Supabase-specific field must be present
    ("code" in err ||
      "details" in err ||
      "hint" in err ||
      ("status" in err &&
        typeof (err as Record<string, unknown>).status === "number"))
  );
}

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("[error]", err);

  if (isSupabaseError(err)) {
    const status =
      typeof err.status === "number" && err.status >= 100 && err.status < 600
        ? err.status
        : 500;

    res.status(status).json({
      error: {
        message: err.message,
        ...(err.code && { code: err.code }),
        ...(err.details && { details: err.details }),
        ...(err.hint && { hint: err.hint }),
      },
    });
    return;
  }

  // Generic fallback for non-Supabase errors
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";

  res.status(500).json({ error: { message } });
};

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
