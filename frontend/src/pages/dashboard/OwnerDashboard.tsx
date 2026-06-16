import {
  Building2,
  CreditCard,
  Home,
  ReceiptText,
  Timer,
  TrendingUp,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertBanner,
  AnimatedValue,
  DashboardTopBar,
  MiniDonut,
  StatCard,
  StatusBadge,
  TenantRosterTable,
  expenseSummary,
  money,
  ownerTickets,
  properties,
  revenueData,
} from "./shared";

export function OwnerDashboard() {
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const occupiedUnits = properties.reduce((sum, p) => sum + p.occupied, 0);
  const monthlyIncome = properties.reduce((sum, p) => sum + p.income, 0);
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  const expenseTotal = expenseSummary.reduce((sum, e) => sum + e.value, 0);

  return (
    <div className="space-y-5">
      <DashboardTopBar
        title="Portfolio Dashboard"
        subtitle="Revenue, occupancy, and property performance across your portfolio."
        action="Add Property"
        badgeCount={7}
      />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
              Portfolio Overview
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-950">
              Three premium assets, one operating picture.
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Properties", properties.length],
              ["Total Units", totalUnits],
              ["Occupied", occupiedUnits],
              ["Vacancy", `${100 - occupancyRate}%`],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-medium uppercase text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              Month-to-date income target
            </span>
            <span className="font-mono font-semibold text-slate-950">
              {money(monthlyIncome)} / {money(335000)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{
                width: `${Math.min((monthlyIncome / 335000) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </section>

      <AlertBanner
        tone="rose"
        title="Action items need review"
        detail="2 tenants are more than 5 days overdue and one maintenance ticket is older than 7 days."
      />

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
          label="Occupancy Rate"
          value={<AnimatedValue value={occupancyRate} suffix="%" />}
          detail={`${occupiedUnits} of ${totalUnits} units occupied`}
          trend={3.2}
          icon={Home}
          tone="text-sky-700"
          chart={<MiniDonut value={occupancyRate} />}
        />
        <StatCard
          label="Pending Payments"
          value={<AnimatedValue value={4} />}
          detail={`${money(18400)} overdue`}
          trend={-6.1}
          icon={ReceiptText}
          tone="text-rose-700"
        />
        <StatCard
          label="Open Maintenance"
          value={<AnimatedValue value={9} />}
          detail={`${money(34350)} estimated`}
          trend={-11}
          icon={Wrench}
          tone="text-amber-700"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">
                Revenue Performance
              </h3>
              <p className="text-sm text-slate-500">
                Last 12 months with expense and vacancy annotations
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
