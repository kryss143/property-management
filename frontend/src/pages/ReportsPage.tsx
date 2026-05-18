import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardPayload } from "@property-management/shared";
import { Badge } from "../components/ui/Badge";
import { getDashboard } from "../lib/api";
import { currency, titleCase } from "../lib/format";
import { useAuth } from "../providers/AuthProvider";

export function ReportsPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    getDashboard(token).then(setDashboard);
  }, [token]);

  if (!dashboard) {
    return <div className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">Loading reports...</div>;
  }

  return (
    <div className="space-y-5">
      <section>
        <p className="text-sm font-medium text-emerald-700">Export-friendly views</p>
        <h2 className="text-2xl font-semibold">Reports</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Revenue, occupancy, and maintenance summaries built from the same operating data as the dashboard.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-base font-semibold">Revenue Report</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.revenue}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <Tooltip formatter={(value) => currency(Number(value))} />
                <Bar dataKey="collected" fill="#059669" radius={[6, 6, 0, 0]} />
                <Bar dataKey="unpaid" fill="#e11d48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-base font-semibold">Occupancy Report</h3>
          <div className="space-y-3">
            {dashboard.occupancy.map((item) => (
              <div key={item.label} className="rounded-lg bg-gray-50 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${Math.min(item.value * 50, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-base font-semibold">Maintenance Report</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dashboard.maintenance.map((item) => (
              <tr key={item.status}>
                <td className="px-4 py-3">
                  <Badge value={item.status} />
                </td>
                <td className="px-4 py-3 text-right font-semibold">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
          Report statuses: {dashboard.maintenance.map((item) => titleCase(item.status)).join(", ")}
        </div>
      </section>
    </div>
  );
}
