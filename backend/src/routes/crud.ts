import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabase.ts";
import { requireAuth, requireRole } from "../middleware/auth.ts";

type TableName =
  | "properties"
  | "units"
  | "tenants"
  | "leases"
  | "payments"
  | "maintenance_requests";

const schemas = {
  properties: z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    type: z.string().min(1),
    description: z.string().nullable().optional(),
    owner_id: z.string().uuid().nullable().optional(),
    image_url: z.string().url().nullable().optional(),
    status: z.enum(["active", "inactive", "maintenance"]).default("active"),
  }),
  units: z.object({
    property_id: z.string().uuid(),
    unit_number: z.string().min(1),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().nonnegative(),
    rent_amount: z.number().nonnegative(),
    status: z
      .enum(["available", "occupied", "maintenance"])
      .default("available"),
  }),
  tenants: z.object({
    profile_id: z.string().uuid().nullable().optional(),
    full_name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().nullable().optional(),
    emergency_contact: z.string().nullable().optional(),
    property_id: z.string().uuid().nullable().optional(),
    unit_id: z.string().uuid().nullable().optional(),
  }),
  leases: z.object({
    tenant_id: z.string().uuid(),
    property_id: z.string().uuid(),
    unit_id: z.string().uuid(),
    start_date: z.string(),
    end_date: z.string(),
    rent_amount: z.number().nonnegative(),
    deposit_amount: z.number().nonnegative(),
    document_url: z.string().url().nullable().optional(),
    status: z.enum(["active", "expired", "upcoming"]).default("active"),
  }),
  payments: z.object({
    tenant_id: z.string().uuid(),
    property_id: z.string().uuid(),
    lease_id: z.string().uuid().nullable().optional(),
    amount_due: z.number().nonnegative(),
    amount_paid: z.number().nonnegative(),
    due_date: z.string(),
    paid_at: z.string().nullable().optional(),
    status: z
      .enum(["paid", "pending", "overdue", "partial"])
      .default("pending"),
  }),
  maintenance_requests: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    status: z
      .enum(["open", "in_progress", "completed", "cancelled"])
      .default("open"),
    property_id: z.string().uuid(),
    unit_id: z.string().uuid().nullable().optional(),
    tenant_id: z.string().uuid().nullable().optional(),
  }),
} satisfies Record<TableName, z.AnyZodObject>;

function createCrudRouter(table: TableName) {
  const router = Router();
  const schema = schemas[table];

  router.get("/", requireAuth, async (req, res) => {
    const search = String(req.query.search ?? "").trim();
    const status = String(req.query.status ?? "").trim();
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const pageSize = Math.min(
      Math.max(Number(req.query.pageSize ?? 20), 1),
      100,
    );
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from(table)
      .select("*", { count: "exact" })
      .range(from, to)
      .order("created_at", {
        ascending: false,
      });

    if (status) {
      query = query.eq("status", status);
    }

    if (
      search &&
      ["properties", "tenants", "maintenance_requests"].includes(table)
    ) {
      const column =
        table === "properties"
          ? "name"
          : table === "tenants"
            ? "full_name"
            : "title";
      query = query.ilike(column, `%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ data, count, page, pageSize });
  });

  router.get("/:id", requireAuth, async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ message: error.message });
    }

    res.json(data);
  });

  router.post(
    "/",
    requireAuth,
    requireRole(["admin", "manager", "landlord"]),
    async (req, res) => {
      const parsed = schema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten(),
        });
      }

      const payload = parsed.data as Record<string, unknown>;
      const { data, error } = await supabaseAdmin
        .from(table)
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      res.status(201).json(data);
    },
  );

  router.patch(
    "/:id",
    requireAuth,
    requireRole(["admin", "manager", "landlord"]),
    async (req, res) => {
      const parsed = schema.partial().safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: parsed.error.flatten(),
        });
      }

      const { data, error } = await supabaseAdmin
        .from(table)
        .update(parsed.data)
        .eq("id", req.params.id)
        .select("*")
        .single();

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      res.json(data);
    },
  );

  router.delete(
    "/:id",
    requireAuth,
    requireRole(["admin", "manager"]),
    async (req, res) => {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq("id", req.params.id);

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      res.status(204).send();
    },
  );

  return router;
}

export const crudRouters = {
  properties: createCrudRouter("properties"),
  units: createCrudRouter("units"),
  tenants: createCrudRouter("tenants"),
  leases: createCrudRouter("leases"),
  payments: createCrudRouter("payments"),
  maintenanceRequests: createCrudRouter("maintenance_requests"),
};
