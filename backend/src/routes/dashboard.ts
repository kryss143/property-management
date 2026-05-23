import { Router } from "express";
import type {
  DashboardPayload,
  MaintenanceStatus,
} from "@property-management/shared/src/index.ts";
import { requireAuth } from "../middleware/auth.ts";
import { supabaseAdmin } from "../supabase.ts";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, async (_req, res) => {
  const [properties, units, tenants, payments, maintenance] = await Promise.all(
    [
      supabaseAdmin.from("properties").select("id,status,created_at"),
      supabaseAdmin.from("units").select("id,status,created_at"),
      supabaseAdmin.from("tenants").select("id,created_at"),
      supabaseAdmin
        .from("payments")
        .select("id,amount_due,amount_paid,due_date,status,created_at"),
      supabaseAdmin
        .from("maintenance_requests")
        .select("id,title,status,created_at"),
    ],
  );

  const firstError = [properties, units, tenants, payments, maintenance].find(
    (result) => result.error,
  )?.error;

  if (firstError) {
    return res.status(500).json({ message: firstError.message });
  }

  const unitRows = units.data ?? [];
  const paymentRows = payments.data ?? [];
  const maintenanceRows = maintenance.data ?? [];
  const occupiedUnits = unitRows.filter(
    (unit) => unit.status === "occupied",
  ).length;
  const rentCollected = paymentRows.reduce(
    (sum, payment) => sum + Number(payment.amount_paid ?? 0),
    0,
  );
  const unpaidRent = paymentRows.reduce((sum, payment) => {
    return (
      sum +
      Math.max(
        Number(payment.amount_due ?? 0) - Number(payment.amount_paid ?? 0),
        0,
      )
    );
  }, 0);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenue = months.map((month, index) => {
    const monthPayments = paymentRows.filter(
      (payment) => new Date(payment.due_date).getMonth() === index,
    );
    return {
      month,
      collected: monthPayments.reduce(
        (sum, payment) => sum + Number(payment.amount_paid ?? 0),
        0,
      ),
      unpaid: monthPayments.reduce((sum, payment) => {
        return (
          sum +
          Math.max(
            Number(payment.amount_due ?? 0) - Number(payment.amount_paid ?? 0),
            0,
          )
        );
      }, 0),
    };
  });

  const statusCounts = maintenanceRows.reduce<
    Record<MaintenanceStatus, number>
  >(
    (counts, request) => {
      counts[request.status as MaintenanceStatus] += 1;
      return counts;
    },
    { open: 0, in_progress: 0, completed: 0, cancelled: 0 },
  );

  const payload: DashboardPayload = {
    metrics: {
      totalProperties: properties.data?.length ?? 0,
      totalUnits: unitRows.length,
      totalTenants: tenants.data?.length ?? 0,
      occupancyRate: unitRows.length
        ? Math.round((occupiedUnits / unitRows.length) * 100)
        : 0,
      rentCollected,
      unpaidRent,
      openMaintenance: statusCounts.open + statusCounts.in_progress,
    },
    revenue,
    occupancy: [
      { label: "Occupied", value: occupiedUnits },
      {
        label: "Available",
        value: unitRows.filter((unit) => unit.status === "available").length,
      },
      {
        label: "Maintenance",
        value: unitRows.filter((unit) => unit.status === "maintenance").length,
      },
    ],
    maintenance: Object.entries(statusCounts).map(([status, count]) => ({
      status: status as MaintenanceStatus,
      count,
    })),
    recentActivity: maintenanceRows.slice(0, 5).map((request) => ({
      id: request.id,
      label: request.title,
      timestamp: request.created_at,
      type: request.status,
    })),
  };

  res.json(payload);
});
