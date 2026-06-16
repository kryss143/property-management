import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import {
  createResource,
  deleteResource,
  listResource,
  updateResource,
} from "../lib/api";
import { currency, shortDate, titleCase } from "../lib/format";
import { useAuth } from "../providers/AuthProvider";

type FieldKind =
  | "text"
  | "number"
  | "date"
  | "email"
  | "url"
  | "textarea"
  | "select";

interface FieldConfig {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  options?: string[];
}

interface ResourceConfig {
  title: string;
  singular: string;
  description: string;
  route: string;
  columns: string[];
  fields: FieldConfig[];
}

const statusOptions = {
  property: ["active", "inactive", "maintenance"],
  unit: ["available", "occupied", "maintenance"],
  lease: ["active", "expired", "upcoming"],
  payment: ["paid", "pending", "overdue", "partial"],
  maintenance: ["open", "in_progress", "completed", "cancelled"],
  priority: ["low", "medium", "high", "urgent"],
};

const configs: Record<string, ResourceConfig> = {
  properties: {
    title: "Properties",
    singular: "Property",
    description:
      "Manage building records, ownership, availability, and images.",
    route: "properties",
    columns: ["name", "address", "type", "status"],
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "address", label: "Address", kind: "text", required: true },
      { key: "type", label: "Type", kind: "text", required: true },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: statusOptions.property,
        required: true,
      },
      { key: "image_url", label: "Image URL", kind: "url" },
      { key: "description", label: "Description", kind: "textarea" },
    ],
  },
  units: {
    title: "Units",
    singular: "Unit",
    description: "Track unit details, market rent, and availability.",
    route: "units",
    columns: ["unit_number", "bedrooms", "bathrooms", "rent_amount", "status"],
    fields: [
      {
        key: "property_id",
        label: "Property ID",
        kind: "text",
        required: true,
      },
      {
        key: "unit_number",
        label: "Unit number",
        kind: "text",
        required: true,
      },
      { key: "bedrooms", label: "Bedrooms", kind: "number", required: true },
      { key: "bathrooms", label: "Bathrooms", kind: "number", required: true },
      {
        key: "rent_amount",
        label: "Rent amount",
        kind: "number",
        required: true,
      },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: statusOptions.unit,
        required: true,
      },
    ],
  },
  tenants: {
    title: "Tenants",
    singular: "Tenant",
    description:
      "Keep resident contacts, emergency details, and assignments current.",
    route: "tenants",
    columns: ["full_name", "email", "phone", "emergency_contact"],
    fields: [
      { key: "full_name", label: "Full name", kind: "text", required: true },
      { key: "email", label: "Email", kind: "email", required: true },
      { key: "phone", label: "Phone", kind: "text" },
      { key: "emergency_contact", label: "Emergency contact", kind: "text" },
      { key: "property_id", label: "Property ID", kind: "text" },
      { key: "unit_id", label: "Unit ID", kind: "text" },
    ],
  },
  leases: {
    title: "Leases",
    singular: "Lease",
    description: "Monitor active, upcoming, and expired lease agreements.",
    route: "leases",
    columns: ["tenant_id", "start_date", "end_date", "rent_amount", "status"],
    fields: [
      { key: "tenant_id", label: "Tenant ID", kind: "text", required: true },
      {
        key: "property_id",
        label: "Property ID",
        kind: "text",
        required: true,
      },
      { key: "unit_id", label: "Unit ID", kind: "text", required: true },
      { key: "start_date", label: "Start date", kind: "date", required: true },
      { key: "end_date", label: "End date", kind: "date", required: true },
      {
        key: "rent_amount",
        label: "Rent amount",
        kind: "number",
        required: true,
      },
      {
        key: "deposit_amount",
        label: "Deposit amount",
        kind: "number",
        required: true,
      },
      { key: "document_url", label: "Document URL", kind: "url" },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: statusOptions.lease,
        required: true,
      },
    ],
  },
  payments: {
    title: "Payments",
    singular: "Payment",
    description:
      "Track monthly rent, partial payments, overdue balances, and paid dates.",
    route: "payments",
    columns: ["tenant_id", "amount_due", "amount_paid", "due_date", "status"],
    fields: [
      { key: "tenant_id", label: "Tenant ID", kind: "text", required: true },
      {
        key: "property_id",
        label: "Property ID",
        kind: "text",
        required: true,
      },
      { key: "lease_id", label: "Lease ID", kind: "text" },
      {
        key: "amount_due",
        label: "Amount due",
        kind: "number",
        required: true,
      },
      {
        key: "amount_paid",
        label: "Amount paid",
        kind: "number",
        required: true,
      },
      { key: "due_date", label: "Due date", kind: "date", required: true },
      { key: "paid_at", label: "Paid date", kind: "date" },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: statusOptions.payment,
        required: true,
      },
    ],
  },
  "maintenance-requests": {
    title: "Maintenance",
    singular: "Request",
    description:
      "Capture tenant issues and move work orders through completion.",
    route: "maintenance-requests",
    columns: ["title", "priority", "status", "created_at"],
    fields: [
      { key: "title", label: "Title", kind: "text", required: true },
      {
        key: "description",
        label: "Description",
        kind: "textarea",
        required: true,
      },
      {
        key: "priority",
        label: "Priority",
        kind: "select",
        options: statusOptions.priority,
        required: true,
      },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: statusOptions.maintenance,
        required: true,
      },
      {
        key: "property_id",
        label: "Property ID",
        kind: "text",
        required: true,
      },
      { key: "unit_id", label: "Unit ID", kind: "text" },
      { key: "tenant_id", label: "Tenant ID", kind: "text" },
    ],
  },
};

export function ResourcePage({ type }: { type: keyof typeof configs }) {
  const { token } = useAuth();
  const config = configs[type];
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [query, setQuery] = useState("");
  // ── debounced search query: only re-filters after 200 ms of no typing ──
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  // ── debounce: update debouncedQuery 200 ms after the user stops typing ──
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  // ── fetch with AbortController so a fast route change never causes a
  //    stale update from a previous in-flight request ──
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setRows([]);

    listResource<Record<string, unknown>>(
      config.route,
      token,
      // controller.signal,
    )
      .then((response) => {
        setRows(response.data);
        // ── auto-open Add form when the resource has no records yet ──
        if (response.data.length === 0) setEditing({});
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [config.route, token]);

  // ── only check the visible columns, not the whole serialised row ──
  const filteredRows = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      config.columns.some((col) =>
        String(row[col] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [debouncedQuery, rows, config.columns]);

  async function handleDelete(id: string) {
    await deleteResource(config.route, id, token);
    setRows((current) => current.filter((row) => row.id !== id));
    setToast(`${config.singular} deleted`);
  }

  function exportCsv() {
    const header = config.columns.join(",");
    const body = filteredRows
      .map((row) =>
        config.columns
          .map((column) => JSON.stringify(row[column] ?? ""))
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${config.route}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            {filteredRows.length} records
          </p>
          <h2 className="text-2xl font-semibold">{config.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {config.description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            className="focus-ring flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold"
            onClick={exportCsv}
          >
            <Download size={17} />
            Export
          </button>
          <button
            className="focus-ring flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white"
            onClick={() => setEditing({})}
          >
            <Plus size={17} />
            Add
          </button>
        </div>
      </section>

      <label className="relative block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          className="focus-ring w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm"
          placeholder={`Search ${config.title.toLowerCase()}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {loading ? (
        <div className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
          Loading {config.title.toLowerCase()}...
        </div>
      ) : filteredRows.length === 0 && debouncedQuery ? (
        // ── only show "no results" empty state when actively searching;
        //    a fresh empty resource auto-opens the Add form instead ──
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="font-semibold">No results for "{debouncedQuery}"</p>
          <p className="mt-1 text-sm text-gray-500">
            Try a different search term.
          </p>
        </div>
      ) : (
        <>
          <MobileList
            rows={filteredRows}
            config={config}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
          <DesktopTable
            rows={filteredRows}
            config={config}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
        </>
      )}

      {editing ? (
        <ResourceForm
          config={config}
          row={editing}
          token={token}
          onSaved={(saved) => {
            setRows((current) => {
              const exists = current.some((row) => row.id === saved.id);
              return exists
                ? current.map((row) => (row.id === saved.id ? saved : row))
                : [saved, ...current];
            });
            setEditing(null);
            setToast(`${config.singular} saved`);
          }}
          onClose={() => setEditing(null)}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-24 left-4 right-4 z-40 rounded-lg bg-gray-950 px-4 py-3 text-sm font-medium text-white shadow-soft sm:left-auto sm:right-6 sm:w-fit md:bottom-6">
          {toast}
          <button className="ml-4 text-gray-300" onClick={() => setToast("")}>
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MobileList({
  rows,
  config,
  onEdit,
  onDelete,
}: {
  rows: Record<string, unknown>[];
  config: ResourceConfig;
  onEdit: (row: Record<string, unknown>) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row) => (
        <article
          key={String(row.id)}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {String(
                  row.name ??
                    row.full_name ??
                    row.title ??
                    row.unit_number ??
                    config.singular,
                )}
              </p>
              <p className="text-xs text-gray-500">
                Created{" "}
                {shortDate(String(row.created_at ?? new Date().toISOString()))}
              </p>
            </div>
            {typeof row.status === "string" ? (
              <Badge value={row.status} />
            ) : null}
          </div>
          <dl className="grid gap-2 text-sm">
            {config.columns.slice(0, 4).map((column) => (
              <div key={column} className="flex justify-between gap-3">
                <dt className="text-gray-500">{titleCase(column)}</dt>
                <dd className="truncate font-medium">
                  {formatValue(column, row[column])}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="focus-ring flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold"
              onClick={() => onEdit(row)}
            >
              <Pencil size={16} />
              Edit
            </button>
            <button
              className="focus-ring flex items-center justify-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
              onClick={() => void onDelete(String(row.id))}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function DesktopTable({
  rows,
  config,
  onEdit,
  onDelete,
}: {
  rows: Record<string, unknown>[];
  config: ResourceConfig;
  onEdit: (row: Record<string, unknown>) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            {config.columns.map((column) => (
              <th key={column} className="px-4 py-3 font-semibold">
                {titleCase(column)}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={String(row.id)}>
              {config.columns.map((column) => (
                <td key={column} className="max-w-[220px] truncate px-4 py-3">
                  {typeof row[column] === "string" &&
                  (column === "status" || column === "priority") ? (
                    <Badge value={String(row[column])} />
                  ) : (
                    formatValue(column, row[column])
                  )}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-gray-300"
                    onClick={() => onEdit(row)}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-700"
                    onClick={() => void onDelete(String(row.id))}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResourceForm({
  config,
  row,
  token,
  onSaved,
  onClose,
}: {
  config: ResourceConfig;
  row: Record<string, unknown>;
  token?: string;
  onSaved: (row: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    return Object.fromEntries(
      config.fields.map((field) => [field.key, String(row[field.key] ?? "")]),
    );
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isEditing = Boolean(row.id);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const payload = Object.fromEntries(
      config.fields.map((field) => {
        const value = form[field.key]?.trim() ?? "";
        if (!value) return [field.key, null];
        if (field.kind === "number") return [field.key, Number(value)];
        return [field.key, value];
      }),
    );

    try {
      const saved = isEditing
        ? await updateResource<Record<string, unknown>>(
            config.route,
            String(row.id),
            token,
            payload,
          )
        : await createResource<Record<string, unknown>>(
            config.route,
            token,
            payload,
          );
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save record");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={`${isEditing ? "Edit" : "Add"} ${config.singular}`}
      onClose={onClose}
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        {config.fields.map((field) => (
          <label
            key={field.key}
            className={`block text-sm font-medium text-gray-700 ${field.kind === "textarea" ? "sm:col-span-2" : ""}`}
          >
            {field.label}
            {renderInput(field, form[field.key] ?? "", (value) =>
              setForm((current) => ({ ...current, [field.key]: value })),
            )}
          </label>
        ))}

        {error ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:flex sm:justify-end">
          <button
            type="button"
            className="focus-ring rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="focus-ring rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
            disabled={busy}
          >
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function renderInput(
  field: FieldConfig,
  value: string,
  onChange: (value: string) => void,
) {
  const base =
    "focus-ring mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm";

  if (field.kind === "textarea") {
    return (
      <textarea
        className={`${base} min-h-28 resize-y`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={field.required}
      />
    );
  }

  if (field.kind === "select") {
    return (
      <select
        className={base}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={field.required}
      >
        <option value="">Select {field.label.toLowerCase()}</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {titleCase(option)}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className={base}
      type={
        field.kind === "email" ||
        field.kind === "url" ||
        field.kind === "date" ||
        field.kind === "number"
          ? field.kind
          : "text"
      }
      step={field.kind === "number" ? "0.01" : undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={field.required}
    />
  );
}

function formatValue(column: string, value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (column.includes("amount") || column === "rent_amount")
    return currency(Number(value));
  if (
    column.includes("date") ||
    column === "created_at" ||
    column === "paid_at"
  )
    return shortDate(String(value));
  return String(value);
}
