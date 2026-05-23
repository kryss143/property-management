import cors from "cors";
import express from "express";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { crudRouters } from "./routes/crud.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { profileRouter } from "./routes/profile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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

// Serve frontend static files if present (SPA). Render may start the app from
// either the repo root or backend/, so resolve against both cwd and this file.
const frontendDistCandidates = [
  process.env.FRONTEND_DIST,
  path.resolve(process.cwd(), "frontend", "dist"),
  path.resolve(process.cwd(), "dist"),
  path.resolve(process.cwd(), "..", "frontend", "dist"),
  path.resolve(process.cwd(), "..", "dist"),
  path.resolve(__dirname, "..", "..", "frontend", "dist"),
  path.resolve(__dirname, "..", "..", "dist"),
].filter(Boolean) as string[];

const frontendDist = frontendDistCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, "index.html")),
);

if (frontendDist) {
  console.log(`[static] Serving frontend from ${frontendDist}`);
  app.use(express.static(frontendDist));
} else {
  console.warn(
    `[static] Frontend build not found. Checked: ${frontendDistCandidates.join(
      ", ",
    )}`,
  );
}

app.use((_req, res, next) => {
  // If the request is for an API route, return 404 JSON
  // otherwise serve the SPA index.html for client-side routing
  if (_req.path.startsWith("/api")) {
    res.status(404).json({ message: "Route not found" });
    return;
  }

  if (!frontendDist) {
    res.status(404).json({
      message:
        "Frontend build not found. Run the frontend build or set FRONTEND_DIST to the directory containing index.html.",
    });
    return;
  }

  const indexHtml = path.join(frontendDist, "index.html");
  res.sendFile(indexHtml, (err) => {
    if (err) next(err);
  });
});

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
