import {
  Activity,
  AlertTriangle,
  Building2,
  ClipboardList,
  CreditCard,
  Download,
  KeyRound,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldOff,
  CheckCircle2,
  SlidersHorizontal,
  Terminal,
  Timer,
  TrendingUp,
  UserCog,
  UserPlus,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { clsx } from "clsx";
import { useAuth } from "../../providers/AuthProvider";
import {
  AlertBanner,
  AnimatedValue,
  AuditEntry,
  DashboardTopBar,
  EmptyState,
  MiniDonut,
  ROLE_COLORS,
  RoleDistributionChart,
  StatCard,
  StatusBadge,
  SystemHealthPanel,
  SystemUser,
  TenantRosterTable,
  auditLog,
  expenseSummary,
  money,
  ownerTickets,
  properties,
  revenueData,
  roleDistribution,
  systemHealth,
  systemUsers,
} from "./shared";

// ── User Management Table (admin-only) ────────────────────────────────────────
function UserManagementTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredUsers = useMemo(
    () =>
      systemUsers.filter((u) => {
        const matchesSearch =
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "All" || u.role === roleFilter;
        return matchesSearch && matchesRole;
      }),
    [searchQuery, roleFilter],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">
            User Management
          </h3>
          <p className="text-sm text-slate-500">
            All system accounts, roles, and access status
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={16}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users…"
              className="h-10 w-52 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <label className="relative">
            <span className="sr-only">Filter by role</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option>All</option>
              <option>admin</option>
              <option>manager</option>
              <option>landlord</option>
              <option>tenant</option>
            </select>
            <SlidersHorizontal
              className="pointer-events-none absolute right-3 top-2.5 text-slate-400"
              size={16}
            />
          </label>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
            <UserPlus size={15} />
            Invite User
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Login</th>
              <th className="px-4 py-3">Properties</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className={clsx(
                  "transition hover:bg-amber-50/50",
                  user.status === "Suspended" && "opacity-60",
                )}
              >
                <td className="whitespace-nowrap px-4 py-4">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <StatusBadge value={user.role} />
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <StatusBadge value={user.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                  {user.lastLogin}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-mono text-slate-600">
                  {user.properties > 0 ? user.properties : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-amber-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                      aria-label={`Edit ${user.name}`}
                    >
                      <UserCog size={15} />
                    </button>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-amber-300 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                      aria-label={`Reset password for ${user.name}`}
                    >
                      <KeyRound size={15} />
                    </button>
                    {user.status === "Suspended" ? (
                      <button
                        className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        aria-label={`Reinstate ${user.name}`}
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    ) : (
                      <button
                        className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        aria-label={`Suspend ${user.name}`}
                      >
                        <ShieldOff size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
        <span>
          Showing {filteredUsers.length} of {systemUsers.length} users
        </span>
        <span className="font-mono">
          {systemUsers.filter((u) => u.status === "Active").length} active ·{" "}
          {systemUsers.filter((u) => u.status === "Suspended").length} suspended
          · {systemUsers.filter((u) => u.status === "Pending").length} pending
        </span>
      </div>
    </div>
  );
}

// ── Audit Log Panel (admin-only) ──────────────────────────────────────────────
function AuditLogPanel() {
  const [severityFilter, setSeverityFilter] = useState<
    "All" | "Info" | "Warning" | "Critical"
  >("All");
  const filtered = auditLog.filter(
    (e) => severityFilter === "All" || e.severity === severityFilter,
  );
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">Audit Log</h3>
          <p className="text-sm text-slate-500">
            System-wide activity trail with severity tagging
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["All", "Info", "Warning", "Critical"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSeverityFilter(level)}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-500",
                severityFilter === level
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600 hover:text-slate-950",
              )}
            >
              {level}
            </button>
          ))}
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className={clsx(
              "flex items-start gap-3 rounded-lg border px-4 py-3",
              entry.severity === "Critical"
                ? "border-rose-200 bg-rose-50"
                : entry.severity === "Warning"
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-100 bg-slate-50",
            )}
          >
            <div
              className={clsx(
                "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold",
                entry.severity === "Critical"
                  ? "bg-rose-100 text-rose-700"
                  : entry.severity === "Warning"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-200 text-slate-600",
              )}
            >
              {entry.severity === "Critical"
                ? "!"
                : entry.severity === "Warning"
                  ? "~"
                  : "·"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-slate-900">
                  {entry.user}
                </span>
                <span className="text-slate-500">{entry.action}</span>
                <span className="rounded-md bg-white px-1.5 py-0.5 text-xs font-mono text-slate-600 ring-1 ring-slate-200">
                  {entry.resource}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{entry.timestamp}</p>
            </div>
            <StatusBadge value={entry.severity} />
          </div>
        ))}
        {filtered.length === 0 && (
          <EmptyState
            title="No entries"
            detail="No audit entries match this filter."
          />
        )}
      </div>
    </section>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const { profile } = useAuth();
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const occupiedUnits = properties.reduce((sum, p) => sum + p.occupied, 0);
  const monthlyIncome = properties.reduce((sum, p) => sum + p.income, 0);
  const expenseTotal = expenseSummary.reduce((sum, e) => sum + e.value, 0);
  const totalUsers = systemUsers.length;
  const activeUsers = systemUsers.filter((u) => u.status === "Active").length;
  const criticalEvents = auditLog.filter(
    (e) => e.severity === "Critical",
  ).length;
  const degradedServices = systemHealth.filter(
    (s) => s.status === "Degraded",
  ).length;

  return (
    <div className="space-y-5">
      <DashboardTopBar
        title="Admin Control Centre"
        subtitle="System-wide operations: users, audit, health, and full property management."
        action="Invite User"
        badgeCount={9}
        adminBadge
      />

      <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
          <div className="p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1">
              <Shield size={13} className="text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Administrator Session
              </span>
            </div>
            <h3 className="text-2xl font-semibold md:text-3xl">
              Welcome back,{" "}
              <span className="text-amber-300">
                {profile?.full_name ?? "Admin"}
              </span>
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              You have full system access.{" "}
              {criticalEvents > 0 && (
                <span className="font-semibold text-rose-400">
                  {criticalEvents} critical security event
                  {criticalEvents > 1 ? "s" : ""} require your attention.
                </span>
              )}{" "}
              {degradedServices > 0 && (
                <span className="font-semibold text-amber-400">
                  {degradedServices} service{degradedServices > 1 ? "s" : ""}{" "}
                  running degraded.
                </span>
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950">
                <Terminal size={14} />
                System Console
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950">
                <Download size={14} />
                Export Full Report
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px border-l border-white/10 bg-white/10 lg:w-72 lg:grid-cols-1">
            {(
              [
                {
                  label: "Total Users",
                  value: totalUsers,
                  Icon: Users,
                  accent: false,
                },
                {
                  label: "Active Now",
                  value: activeUsers,
                  Icon: Activity,
                  accent: false,
                },
                {
                  label: "Critical Alerts",
                  value: criticalEvents,
                  Icon: AlertTriangle,
                  accent: "rose",
                },
                {
                  label: "Degraded Services",
                  value: degradedServices,
                  Icon: Server,
                  accent: "amber",
                },
              ] as {
                label: string;
                value: number;
                Icon: React.ElementType;
                accent: false | "rose" | "amber";
              }[]
            ).map(({ label, value, Icon, accent }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-slate-950 px-5 py-4"
              >
                <div>
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p
                    className={clsx(
                      "mt-0.5 text-2xl font-semibold",
                      accent === "rose" && value > 0
                        ? "text-rose-400"
                        : accent === "amber" && value > 0
                          ? "text-amber-400"
                          : "text-white",
                    )}
                  >
                    {value}
                  </p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-slate-400">
                  <Icon size={17} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly Revenue"
          value={<AnimatedValue value={monthlyIncome} prefix="$" />}
          detail="Across all active leases"
          trend={8.4}
          icon={TrendingUp}
          tone="text-emerald-700"
        />
        <StatCard
          label="Platform Users"
          value={<AnimatedValue value={totalUsers} />}
          detail={`${activeUsers} active accounts`}
          trend={12.3}
          icon={Users}
          tone="text-sky-700"
        />
        <StatCard
          label="Pending Actions"
          value={<AnimatedValue value={5} />}
          detail="Overdue rent + open tickets"
          trend={-6.1}
          icon={ClipboardList}
          tone="text-rose-700"
        />
        <StatCard
          label="System Uptime"
          value="99.7%"
          detail="All services this month"
          trend={0.2}
          icon={Zap}
          tone="text-violet-700"
        />
      </section>

      <AlertBanner
        tone="rose"
        title="Security event detected"
        detail="3 failed login attempts on USR-006 (Ari Kim) — account suspended automatically on May 28."
      />

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <SystemHealthPanel />
        <RoleDistributionChart />
      </section>

      <UserManagementTable />
      <AuditLogPanel />

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">
                Revenue Performance
              </h3>
              <p className="text-sm text-slate-500">
                Last 12 months — admin read view
              </p>
            </div>
            <div
              className="inline-flex rounded-lg bg-slate-100 p-1"
              role="group"
            >
              <button className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-950 shadow-sm">
                Aggregated
              </button>
              <button className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-950">
                By Property
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ left: 0, right: 12, top: 10, bottom: 0 }}
              >
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${Number(v) / 1000}k`}
                />
                <Tooltip formatter={(v) => money(Number(v))} />
                <Area
                  dataKey="revenue"
                  stroke="#0f172a"
                  fill="#cbd5e1"
                  strokeWidth={2}
                />
                <Area
                  dataKey="expenses"
                  stroke="#d97706"
                  fill="#fde68a"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {revenueData
              .filter((m) => m.note)
              .map((m) => (
                <span
                  key={m.month}
                  className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                >
                  {m.month}: {m.note}
                </span>
              ))}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <h3 className="text-xl font-semibold text-slate-950">
            Maintenance & Expenses
          </h3>
          <div className="mt-4 space-y-3">
            {ownerTickets.map((ticket) => (
              <div key={ticket.title} className="rounded-lg bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {ticket.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {ticket.vendor} - {ticket.age}
                    </p>
                  </div>
                  <StatusBadge value={ticket.status} />
                </div>
                <p className="mt-2 font-mono text-sm font-semibold text-slate-700">
                  {money(ticket.cost)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseSummary}>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip formatter={(v) => money(Number(v))} />
                <Bar dataKey="value" fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 text-white">
            <p className="text-sm text-slate-300">Expense vs income ratio</p>
            <p className="mt-1 text-2xl font-semibold">
              {Math.round((expenseTotal / monthlyIncome) * 100)}%
            </p>
          </div>
        </section>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {properties.map((property) => (
          <article
            key={property.name}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.10)]"
          >
            <img
              src={property.image}
              alt={`${property.name} exterior`}
              className="h-36 w-full object-cover"
            />
            <div className="p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">
                    {property.name}
                  </h3>
                  <p className="text-sm text-slate-500">{property.address}</p>
                </div>
                <StatusBadge value={property.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="text-slate-500">Units</p>
                  <p className="font-semibold">{property.units}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="text-slate-500">Occupancy</p>
                  <p className="font-semibold">
                    {Math.round((property.occupied / property.units) * 100)}%
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="text-slate-500">Income</p>
                  <p className="font-mono font-semibold">
                    {money(property.income)}
                  </p>
                </div>
              </div>
              <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                <Building2 size={16} />
                View property detail
              </button>
            </div>
          </article>
        ))}
      </section>

      <TenantRosterTable />

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          [
            "Leases expiring in 30 days",
            "Daniel Park - Unit 9E - Jun 19",
            Timer,
          ],
          [
            "Overdue rent",
            "Ari Kim and Daniel Park require follow-up",
            CreditCard,
          ],
          [
            "Unresolved ticket over 7 days",
            "Harbor Row roof drain clearing",
            Wrench,
          ],
        ].map(([title, detail, Icon]) => (
          <article
            key={title as string}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-rose-50 text-rose-700">
              <Icon size={19} />
            </div>
            <h3 className="font-semibold text-slate-950">
              {title?.toString()}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{detail?.toString()}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
