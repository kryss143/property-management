import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  CreditCard,
  Home,
  KeyRound,
  UsersRound,
  Wrench,
} from "lucide-react";
import type { DashboardPayload } from "@property-management/shared";
import { Badge } from "../components/ui/Badge";
import { getDashboard } from "../lib/api";
import { currency, shortDate, titleCase } from "../lib/format";
import { useAuth } from "../providers/AuthProvider";

const colors = ["#059669", "#2563eb", "#f97316", "#e11d48"];

export function DashboardPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    getDashboard(token).then(setDashboard);
  }, [token]);

  if (!dashboard) {
    return (
      <div className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
        Loading dashboard...
      </div>
    );
  }

  const stats = [
    {
      label: "Properties",
      value: dashboard.metrics.totalProperties,
      icon: Building2,
      tone: "text-emerald-700",
    },
    {
      label: "Units",
      value: dashboard.metrics.totalUnits,
      icon: KeyRound,
      tone: "text-blue-700",
    },
    {
      label: "Tenants",
      value: dashboard.metrics.totalTenants,
      icon: UsersRound,
      tone: "text-violet-700",
    },
    {
      label: "Occupancy",
      value: `${dashboard.metrics.occupancyRate}%`,
      icon: Home,
      tone: "text-orange-700",
    },
    {
      label: "Rent collected",
      value: currency(dashboard.metrics.rentCollected),
      icon: CreditCard,
      tone: "text-emerald-700",
    },
    {
      label: "Unpaid rent",
      value: currency(dashboard.metrics.unpaidRent),
      icon: CreditCard,
      tone: "text-rose-700",
    },
    {
      label: "Open work",
      value: dashboard.metrics.openMaintenance,
      icon: Wrench,
      tone: "text-amber-700",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <Icon className={stat.tone} size={20} />
              </div>
              <p className="text-2xl font-semibold tracking-normal">
                {stat.value}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Revenue</h2>
            <Badge value="active" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.revenue}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${Number(value) / 1000}k`}
                />
                <Tooltip formatter={(value) => currency(Number(value))} />
                <Area
                  dataKey="collected"
                  stroke="#059669"
                  fill="#a7f3d0"
                  strokeWidth={2}
                />
                <Area
                  dataKey="unpaid"
                  stroke="#e11d48"
                  fill="#fecdd3"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Occupancy</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboard.occupancy}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={92}
                >
                  {dashboard.occupancy.map((_entry, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2 text-sm">
            {dashboard.occupancy.map((entry, index) => (
              <div
                key={entry.label}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2 text-gray-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: colors[index] }}
                  />
                  {entry.label}
                </span>
                <span className="font-semibold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Maintenance Status</h2>
          <div className="space-y-3">
            {dashboard.maintenance.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-3"
              >
                <Badge value={item.status} />
                <span className="text-lg font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Recent Activity</h2>
          <div className="space-y-3">
            {dashboard.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {activity.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {shortDate(activity.timestamp)}
                  </p>
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {titleCase(activity.type)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
