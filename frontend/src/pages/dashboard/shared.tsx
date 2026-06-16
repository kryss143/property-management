import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  ChevronDown,
  Download,
  Eye,
  Flag,
  Inbox,
  Plus,
  Send,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import { clsx } from "clsx";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";

export type PaymentRow = {
  month: string;
  amount: number;
  dueDate: string;
  paidDate: string;
  status: "Paid" | "Pending" | "Late";
};

export type TenantRow = {
  name: string;
  unit: string;
  leaseStart: string;
  leaseEnd: string;
  rent: number;
  paymentStatus: "Current" | "Pending" | "Overdue";
  lastContact: string;
  property: string;
};

export type SystemUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "landlord" | "tenant";
  status: "Active" | "Suspended" | "Pending";
  lastLogin: string;
  properties: number;
};

export type AuditEntry = {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  severity: "Info" | "Warning" | "Critical";
};

// ─── Static Data ──────────────────────────────────────────────────────────────

export const properties = [
  {
    name: "Aurelia Heights",
    address: "18 Valero Street, Makati",
    units: 24,
    occupied: 23,
    income: 128600,
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "Harbor Row Residences",
    address: "42 Seaside Avenue, Pasay",
    units: 18,
    occupied: 16,
    income: 94300,
    status: "Needs Attention",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=640&q=80",
  },
  {
    name: "The Meridian Lofts",
    address: "7 Sapphire Road, BGC",
    units: 12,
    occupied: 12,
    income: 87500,
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=640&q=80",
  },
];

export const revenueData = [
  { month: "Jul", revenue: 251000, expenses: 42000, note: "" },
  { month: "Aug", revenue: 258400, expenses: 39800, note: "" },
  { month: "Sep", revenue: 262500, expenses: 45600, note: "" },
  { month: "Oct", revenue: 249800, expenses: 52200, note: "Vacancy" },
  { month: "Nov", revenue: 271300, expenses: 43800, note: "" },
  { month: "Dec", revenue: 286700, expenses: 48600, note: "" },
  { month: "Jan", revenue: 292100, expenses: 55200, note: "" },
  { month: "Feb", revenue: 287900, expenses: 84200, note: "Elevator" },
  { month: "Mar", revenue: 299400, expenses: 47100, note: "" },
  { month: "Apr", revenue: 306200, expenses: 49200, note: "" },
  { month: "May", revenue: 310400, expenses: 53600, note: "" },
  { month: "Jun", revenue: 317200, expenses: 57400, note: "" },
];

export const paymentHistory: PaymentRow[] = [
  {
    month: "June 2026",
    amount: 4200,
    dueDate: "Jun 05",
    paidDate: "-",
    status: "Pending",
  },
  {
    month: "May 2026",
    amount: 4200,
    dueDate: "May 05",
    paidDate: "May 03",
    status: "Paid",
  },
  {
    month: "April 2026",
    amount: 4200,
    dueDate: "Apr 05",
    paidDate: "Apr 06",
    status: "Paid",
  },
  {
    month: "March 2026",
    amount: 4200,
    dueDate: "Mar 05",
    paidDate: "Mar 12",
    status: "Late",
  },
  {
    month: "February 2026",
    amount: 4200,
    dueDate: "Feb 05",
    paidDate: "Feb 04",
    status: "Paid",
  },
  {
    month: "January 2026",
    amount: 4200,
    dueDate: "Jan 05",
    paidDate: "Jan 02",
    status: "Paid",
  },
];

export const tenantRoster: TenantRow[] = [
  {
    name: "Maya Santiago",
    unit: "3B",
    leaseStart: "2025-09-01",
    leaseEnd: "2026-08-31",
    rent: 4200,
    paymentStatus: "Current",
    lastContact: "Today",
    property: "Aurelia Heights",
  },
  {
    name: "Liam Bennett",
    unit: "8A",
    leaseStart: "2025-07-15",
    leaseEnd: "2026-07-14",
    rent: 5100,
    paymentStatus: "Pending",
    lastContact: "Yesterday",
    property: "The Meridian Lofts",
  },
  {
    name: "Ari Kim",
    unit: "11C",
    leaseStart: "2025-08-01",
    leaseEnd: "2026-06-28",
    rent: 3900,
    paymentStatus: "Overdue",
    lastContact: "5 days ago",
    property: "Harbor Row Residences",
  },
  {
    name: "Noah Reyes",
    unit: "2D",
    leaseStart: "2025-11-01",
    leaseEnd: "2026-10-31",
    rent: 3650,
    paymentStatus: "Current",
    lastContact: "May 29",
    property: "Aurelia Heights",
  },
  {
    name: "Sofia Tan",
    unit: "5F",
    leaseStart: "2026-01-01",
    leaseEnd: "2026-12-31",
    rent: 4750,
    paymentStatus: "Current",
    lastContact: "May 22",
    property: "The Meridian Lofts",
  },
  {
    name: "Ethan Cruz",
    unit: "7B",
    leaseStart: "2025-10-01",
    leaseEnd: "2026-09-30",
    rent: 4100,
    paymentStatus: "Pending",
    lastContact: "May 18",
    property: "Harbor Row Residences",
  },
  {
    name: "Clara Yu",
    unit: "4A",
    leaseStart: "2025-12-01",
    leaseEnd: "2026-11-30",
    rent: 4425,
    paymentStatus: "Current",
    lastContact: "May 16",
    property: "Aurelia Heights",
  },
  {
    name: "Daniel Park",
    unit: "9E",
    leaseStart: "2025-06-20",
    leaseEnd: "2026-06-19",
    rent: 5300,
    paymentStatus: "Overdue",
    lastContact: "May 12",
    property: "The Meridian Lofts",
  },
];

export const maintenanceRequests = [
  {
    title: "Kitchen sink pressure drops after 8 PM",
    category: "Plumbing",
    submitted: "Jun 02",
    priority: "Medium",
    status: "Scheduled",
    step: 2,
  },
  {
    title: "Bedroom outlet sparking intermittently",
    category: "Electrical",
    submitted: "May 31",
    priority: "High",
    status: "In Review",
    step: 1,
  },
  {
    title: "Balcony sliding door track repair",
    category: "Carpentry",
    submitted: "May 24",
    priority: "Low",
    status: "Submitted",
    step: 0,
  },
];

export const ownerTickets = [
  {
    title: "Aurelia Heights elevator inspection",
    vendor: "LiftPro Manila",
    cost: 18400,
    status: "Scheduled",
    age: "3 days",
  },
  {
    title: "Harbor Row roof drain clearing",
    vendor: "BlueLine Works",
    cost: 9200,
    status: "In Review",
    age: "8 days",
  },
  {
    title: "Meridian Lofts lobby lighting",
    vendor: "Northstar Electric",
    cost: 6750,
    status: "Assigned",
    age: "2 days",
  },
];

export const expenseSummary = [
  { label: "Maintenance", value: 57400 },
  { label: "Utilities", value: 26800 },
  { label: "Insurance", value: 18400 },
  { label: "Management Fees", value: 31200 },
];

export const systemUsers: SystemUser[] = [
  {
    id: "USR-001",
    name: "Carlos Mendoza",
    email: "carlos@keynest.ph",
    role: "admin",
    status: "Active",
    lastLogin: "Today, 9:14 AM",
    properties: 0,
  },
  {
    id: "USR-002",
    name: "Patricia Reyes",
    email: "patricia@keynest.ph",
    role: "manager",
    status: "Active",
    lastLogin: "Today, 8:02 AM",
    properties: 3,
  },
  {
    id: "USR-003",
    name: "Marco Villanueva",
    email: "marco@keynest.ph",
    role: "landlord",
    status: "Active",
    lastLogin: "Yesterday",
    properties: 3,
  },
  {
    id: "USR-004",
    name: "Jasmine Corpuz",
    email: "jasmine@keynest.ph",
    role: "manager",
    status: "Pending",
    lastLogin: "Never",
    properties: 0,
  },
  {
    id: "USR-005",
    name: "Maya Santiago",
    email: "maya@tenant.keynest.ph",
    role: "tenant",
    status: "Active",
    lastLogin: "Jun 04",
    properties: 0,
  },
  {
    id: "USR-006",
    name: "Ari Kim",
    email: "ari@tenant.keynest.ph",
    role: "tenant",
    status: "Suspended",
    lastLogin: "May 28",
    properties: 0,
  },
  {
    id: "USR-007",
    name: "Daniel Park",
    email: "daniel@tenant.keynest.ph",
    role: "tenant",
    status: "Active",
    lastLogin: "Jun 01",
    properties: 0,
  },
  {
    id: "USR-008",
    name: "Liam Bennett",
    email: "liam@tenant.keynest.ph",
    role: "tenant",
    status: "Active",
    lastLogin: "Jun 03",
    properties: 0,
  },
];

export const auditLog: AuditEntry[] = [
  {
    id: "AUD-001",
    user: "Patricia Reyes",
    action: "Updated lease terms",
    resource: "Lease #LZ-2204",
    timestamp: "Today 09:42 AM",
    severity: "Info",
  },
  {
    id: "AUD-002",
    user: "Carlos Mendoza",
    action: "Suspended user account",
    resource: "USR-006 (Ari Kim)",
    timestamp: "Today 09:18 AM",
    severity: "Warning",
  },
  {
    id: "AUD-003",
    user: "System",
    action: "Auto-flagged overdue payment",
    resource: "Payment #PAY-8821",
    timestamp: "Today 08:00 AM",
    severity: "Warning",
  },
  {
    id: "AUD-004",
    user: "Marco Villanueva",
    action: "Exported payment report",
    resource: "Report Q2-2026",
    timestamp: "Yesterday 4:55 PM",
    severity: "Info",
  },
  {
    id: "AUD-005",
    user: "Patricia Reyes",
    action: "Dismissed maintenance ticket",
    resource: "Ticket #MNT-441",
    timestamp: "Yesterday 2:30 PM",
    severity: "Info",
  },
  {
    id: "AUD-006",
    user: "System",
    action: "Failed login attempt (x3)",
    resource: "USR-006 (Ari Kim)",
    timestamp: "May 28, 11:12 PM",
    severity: "Critical",
  },
  {
    id: "AUD-007",
    user: "Carlos Mendoza",
    action: "Granted manager permissions",
    resource: "USR-004 (Jasmine Corpuz)",
    timestamp: "May 27, 3:00 PM",
    severity: "Info",
  },
];

export const systemHealth = [
  {
    label: "API Gateway",
    status: "Operational",
    uptime: "99.97%",
    latency: "42ms",
  },
  {
    label: "Database",
    status: "Operational",
    uptime: "99.99%",
    latency: "8ms",
  },
  {
    label: "File Storage",
    status: "Operational",
    uptime: "100%",
    latency: "120ms",
  },
  {
    label: "Email Service",
    status: "Degraded",
    uptime: "97.2%",
    latency: "2.4s",
  },
  {
    label: "SMS Alerts",
    status: "Operational",
    uptime: "99.8%",
    latency: "340ms",
  },
];

export const roleDistribution = [
  { label: "Tenants", value: 51 },
  { label: "Landlords", value: 14 },
  { label: "Managers", value: 8 },
  { label: "Admins", value: 3 },
];

export const ROLE_COLORS = ["#0f172a", "#d97706", "#0891b2", "#64748b"];

// ─── Utilities ────────────────────────────────────────────────────────────────

export const statusTone: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Current: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Operational: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Scheduled: "bg-sky-50 text-sky-700 ring-sky-200",
  Assigned: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "In Review": "bg-violet-50 text-violet-700 ring-violet-200",
  Submitted: "bg-slate-100 text-slate-700 ring-slate-200",
  Late: "bg-rose-50 text-rose-700 ring-rose-200",
  Overdue: "bg-rose-50 text-rose-700 ring-rose-200",
  "Needs Attention": "bg-rose-50 text-rose-700 ring-rose-200",
  Suspended: "bg-rose-50 text-rose-700 ring-rose-200",
  Degraded: "bg-amber-50 text-amber-700 ring-amber-200",
  Critical: "bg-rose-50 text-rose-700 ring-rose-200",
  Warning: "bg-amber-50 text-amber-700 ring-amber-200",
  Info: "bg-slate-100 text-slate-600 ring-slate-200",
  admin: "bg-slate-950 text-white ring-slate-800",
  manager: "bg-sky-50 text-sky-700 ring-sky-200",
  landlord: "bg-amber-50 text-amber-700 ring-amber-200",
  tenant: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function useCountUp(target: number, duration = 850) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    let start: number | null = null;
    const animate = (timestamp: number) => {
      start ??= timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration, target]);
  return value;
}

// ─── Shared Components ────────────────────────────────────────────────────────

export function AnimatedValue({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const count = useCountUp(value);
  return (
    <span className="font-mono tracking-normal">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        statusTone[value] ?? "bg-slate-100 text-slate-700 ring-slate-200",
      )}
    >
      {value}
    </span>
  );
}

export function StatCard({
  label,
  value,
  detail,
  trend,
  icon: Icon,
  tone = "text-slate-700",
  chart,
}: {
  label: string;
  value: React.ReactNode;
  detail: string;
  trend: number;
  icon: React.ElementType;
  tone?: string;
  chart?: React.ReactNode;
}) {
  const isUp = trend >= 0;
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.10)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <div
          className={clsx(
            "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-50",
            tone,
          )}
        >
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500">{detail}</span>
        {chart ?? (
          <span
            className={clsx(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
              isUp
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700",
            )}
          >
            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </article>
  );
}

export function DashboardTopBar({
  title,
  subtitle,
  action,
  badgeCount,
  adminBadge,
}: {
  title: string;
  subtitle: string;
  action: string;
  badgeCount: number;
  adminBadge?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
            KeyNest Prime
          </p>
          {adminBadge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-300 ring-1 ring-slate-800">
              <Shield size={10} />
              System Admin
            </span>
          )}
        </div>
        <h2 className="mt-1 text-3xl font-bold text-slate-950 md:text-4xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="relative grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-amber-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          aria-label={`${badgeCount} unread notifications`}
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
            {badgeCount}
          </span>
        </button>
        <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
          <Plus size={18} />
          {action}
        </button>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="grid min-h-44 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div>
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white text-slate-500 shadow-sm">
          <Inbox size={22} />
        </div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

export function AlertBanner({
  tone,
  title,
  detail,
}: {
  tone: "amber" | "rose";
  title: string;
  detail: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-start gap-3 rounded-lg border p-4",
        tone === "amber"
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-rose-200 bg-rose-50 text-rose-950",
      )}
      role="status"
    >
      <AlertTriangle className="mt-0.5 shrink-0" size={19} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm opacity-80">{detail}</p>
      </div>
    </div>
  );
}

export function SortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      onClick={onClick}
      aria-sort={
        active ? (direction === "asc" ? "ascending" : "descending") : "none"
      }
    >
      {label}
      <ChevronDown
        size={14}
        className={clsx(
          "transition",
          active && direction === "asc" && "rotate-180",
        )}
      />
    </button>
  );
}

export function MiniDonut({ value }: { value: number }) {
  const data = [
    { label: "Occupied", value },
    { label: "Vacant", value: 100 - value },
  ];
  return (
    <div className="h-10 w-10" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={13}
            outerRadius={19}
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill="#0f766e" />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PaymentTable() {
  const [sortKey, setSortKey] = useState<keyof PaymentRow>("month");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const sortedRows = useMemo(() => {
    return [...paymentHistory].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      const result =
        typeof aValue === "number" && typeof bValue === "number"
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));
      return direction === "asc" ? result : -result;
    });
  }, [direction, sortKey]);
  const setSort = (key: keyof PaymentRow) => {
    setDirection(sortKey === key && direction === "asc" ? "desc" : "asc");
    setSortKey(key);
  };
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">
            Payment History
          </h3>
          <p className="text-sm text-slate-500">
            Recent rent activity and receipts
          </p>
        </div>
        <span className="text-sm font-medium text-slate-500">Page 1 of 2</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {[
                ["Month", "month"],
                ["Amount", "amount"],
                ["Due Date", "dueDate"],
                ["Paid Date", "paidDate"],
                ["Status", "status"],
              ].map(([label, key]) => (
                <th key={key} className="px-4 py-3">
                  <SortButton
                    label={label}
                    active={sortKey === key}
                    direction={direction}
                    onClick={() => setSort(key as keyof PaymentRow)}
                  />
                </th>
              ))}
              <th className="px-4 py-3">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((row) => (
              <tr key={row.month} className="transition hover:bg-amber-50/50">
                <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">
                  {row.month}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-mono text-slate-700">
                  {money(row.amount)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  {row.dueDate}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  {row.paidDate}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <StatusBadge value={row.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <button
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-amber-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    aria-label={`Download receipt for ${row.month}`}
                  >
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TenantRosterTable() {
  const [filter, setFilter] = useState("All");
  const [sortKey, setSortKey] = useState<keyof TenantRow>("leaseEnd");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const rows = useMemo(() => {
    const filtered =
      filter === "All"
        ? tenantRoster
        : tenantRoster.filter(
            (t) => t.paymentStatus === filter || t.property === filter,
          );
    return [...filtered].sort((a, b) => {
      const result = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return direction === "asc" ? result : -result;
    });
  }, [direction, filter, sortKey]);
  const setSort = (key: keyof TenantRow) => {
    setDirection(sortKey === key && direction === "asc" ? "desc" : "asc");
    setSortKey(key);
  };
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">
            Tenant Roster
          </h3>
          <p className="text-sm text-slate-500">
            Filter by property, status, or lease window
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Filter tenant roster</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option>All</option>
              <option>Current</option>
              <option>Pending</option>
              <option>Overdue</option>
              {properties.map((p) => (
                <option key={p.name}>{p.name}</option>
              ))}
            </select>
            <SlidersHorizontal
              className="pointer-events-none absolute right-3 top-2.5 text-slate-400"
              size={16}
            />
          </label>
          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
            30 / 60 / 90 days
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {[
                ["Tenant Name", "name"],
                ["Unit", "unit"],
                ["Lease Start", "leaseStart"],
                ["Lease End", "leaseEnd"],
                ["Rent", "rent"],
                ["Payment Status", "paymentStatus"],
                ["Last Contact", "lastContact"],
              ].map(([label, key]) => (
                <th key={key} className="px-4 py-3">
                  <SortButton
                    label={label}
                    active={sortKey === key}
                    direction={direction}
                    onClick={() => setSort(key as keyof TenantRow)}
                  />
                </th>
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((tenant) => (
              <tr
                key={`${tenant.name}-${tenant.unit}`}
                className="transition hover:bg-amber-50/50"
              >
                <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">
                  {tenant.name}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  {tenant.unit}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  {tenant.leaseStart}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  {tenant.leaseEnd}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-mono text-slate-700">
                  {money(tenant.rent)}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <StatusBadge value={tenant.paymentStatus} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  {tenant.lastContact}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="flex items-center gap-1">
                    {(
                      [
                        [Eye, "View profile"],
                        [Send, "Send message"],
                        [Flag, "Flag tenant"],
                      ] as const
                    ).map(([Icon, label]) => (
                      <button
                        key={label}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-amber-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        aria-label={`${label} for ${tenant.name}`}
                      >
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
        <span>
          Showing {rows.length} of {tenantRoster.length} tenants
        </span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}

export function MaintenancePanel() {
  const [showForm, setShowForm] = useState(false);
  const steps = ["Submitted", "In Review", "Scheduled", "Resolved"];
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">
            Maintenance Requests
          </h3>
          <p className="text-sm text-slate-500">
            Active tickets and repair progress
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          aria-expanded={showForm}
        >
          <Plus size={16} />
          Submit New Request
        </button>
      </div>
      {showForm && (
        <form className="mb-4 grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-[1fr_160px_140px_auto]">
          <label>
            <span className="sr-only">Issue title</span>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Issue title"
            />
          </label>
          <label>
            <span className="sr-only">Category</span>
            <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Appliance</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Priority</span>
            <select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option>Medium</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </label>
          <button className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white">
            Send
          </button>
        </form>
      )}
      <div className="space-y-3">
        {maintenanceRequests.length ? (
          maintenanceRequests.map((req) => (
            <article
              key={req.title}
              className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition hover:border-amber-200 hover:bg-amber-50/40"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="font-semibold text-slate-950">{req.title}</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    {req.category} - submitted {req.submitted} - {req.priority}{" "}
                    priority
                  </p>
                </div>
                <StatusBadge value={req.status} />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {steps.map((step, i) => (
                  <div key={step} className="min-w-0">
                    <div
                      className={clsx(
                        "h-1.5 rounded-full",
                        i <= req.step ? "bg-amber-500" : "bg-slate-200",
                      )}
                    />
                    <p className="mt-2 truncate text-xs font-medium text-slate-500">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            title="No active requests"
            detail="Submitted maintenance tickets will appear here."
          />
        )}
      </div>
    </section>
  );
}

// Admin-only shared components

export function SystemHealthPanel() {
  const [refreshing, setRefreshing] = useState(false);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">
            System Health
          </h3>
          <p className="text-sm text-slate-500">
            Live service status and uptime
          </p>
        </div>
        <button
          onClick={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 1200);
          }}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:border-amber-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          {/* RefreshCw imported in AdminDashboard.tsx */}
          Refresh
        </button>
      </div>
      <div className="space-y-2">
        {systemHealth.map((svc) => (
          <div
            key={svc.label}
            className={clsx(
              "flex items-center justify-between rounded-lg border px-4 py-3",
              svc.status === "Degraded"
                ? "border-amber-200 bg-amber-50"
                : "border-slate-100 bg-slate-50",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "h-2.5 w-2.5 rounded-full",
                  svc.status === "Operational"
                    ? "bg-emerald-500"
                    : "bg-amber-500",
                )}
              />
              <span className="font-semibold text-slate-900">{svc.label}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="hidden font-mono text-slate-500 sm:inline">
                Latency: {svc.latency}
              </span>
              <span className="hidden font-mono text-slate-500 sm:inline">
                Uptime: {svc.uptime}
              </span>
              <StatusBadge value={svc.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RoleDistributionChart() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <h3 className="text-xl font-semibold text-slate-950">
        User Distribution
      </h3>
      <p className="text-sm text-slate-500">
        Role breakdown across the platform
      </p>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={roleDistribution}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={44}
              paddingAngle={3}
            >
              {roleDistribution.map((_, i) => (
                <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v} users`, ""]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {roleDistribution.map((item, i) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: ROLE_COLORS[i] }}
            />
            <span className="text-slate-600">{item.label}</span>
            <span className="ml-auto font-mono font-semibold text-slate-950">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
