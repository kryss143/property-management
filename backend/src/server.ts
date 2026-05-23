import cors from "cors";
import express from "express";
import morgan from "morgan";
import { config } from "./config.js";
import { crudRouters } from "./routes/crud.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { profileRouter } from "./routes/profile.js";

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

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
