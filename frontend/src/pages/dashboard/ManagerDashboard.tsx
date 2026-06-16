import {
  AlertTriangle,
  Building2,
  ClipboardList,
  CreditCard,
  Home,
  UsersRound,
  Wrench,
} from "lucide-react";
import { clsx } from "clsx";
import {
  AlertBanner,
  AnimatedValue,
  DashboardTopBar,
  MaintenancePanel,
  MiniDonut,
  StatCard,
  StatusBadge,
  TenantRosterTable,
  formatDate,
  maintenanceRequests,
  properties,
  tenantRoster,
} from "./shared";

export function ManagerDashboard() {
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const occupiedUnits = properties.reduce((sum, p) => sum + p.occupied, 0);
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  const overdueCount = tenantRoster.filter(
    (t) => t.paymentStatus === "Overdue",
  ).length;
  const pendingCount = tenantRoster.filter(
    (t) => t.paymentStatus === "Pending",
  ).length;
  const openMaintenance = maintenanceRequests.filter(
    (r) => r.status !== "Resolved",
  ).length;

  return (
    <div className="space-y-5">
      <DashboardTopBar
        title="Operations Dashboard"
        subtitle="Day-to-day operations: tenants, maintenance, and rent collection."
        action="Add Tenant"
        badgeCount={5}
      />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:p-6">
          <div>
            <p className="text-sm font-medium text-sky-300">
              {formatDate(new Date())}
            </p>
            <h3 className="mt-2 text-3xl font-semibold md:text-4xl">
              Operations Summary
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Managing {properties.length} properties with {totalUnits} total
              units. {overdueCount} tenants are overdue and {openMaintenance}{" "}
              maintenance requests are active.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm text-slate-300">Occupancy rate</p>
            <p className="mt-2 text-4xl font-semibold text-sky-300">
              <AnimatedValue value={occupancyRate} suffix="%" />
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {occupiedUnits} of {totalUnits} units filled
            </p>
          </div>
        </div>
      </section>

      {overdueCount > 0 && (
        <AlertBanner
          tone="rose"
          title={`${overdueCount} tenant${overdueCount > 1 ? "s" : ""} overdue on rent`}
          detail="Follow up with Ari Kim and Daniel Park — both are more than 5 days past due."
        />
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Tenants"
          value={<AnimatedValue value={tenantRoster.length} />}
          detail={`${tenantRoster.filter((t) => t.paymentStatus === "Current").length} current on rent`}
          trend={4.2}
          icon={UsersRound}
          tone="text-sky-700"
        />
        <StatCard
          label="Occupancy Rate"
          value={<AnimatedValue value={occupancyRate} suffix="%" />}
          detail={`${occupiedUnits} of ${totalUnits} units occupied`}
          trend={3.2}
          icon={Home}
          tone="text-emerald-700"
          chart={<MiniDonut value={occupancyRate} />}
        />
        <StatCard
          label="Overdue Payments"
          value={<AnimatedValue value={overdueCount} />}
          detail={`${pendingCount} more pending this month`}
          trend={-6.1}
          icon={CreditCard}
          tone="text-rose-700"
        />
        <StatCard
          label="Open Maintenance"
          value={<AnimatedValue value={openMaintenance} />}
          detail="1 high priority, 1 urgent"
          trend={-11}
          icon={Wrench}
          tone="text-amber-700"
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">
              Property Status
            </h3>
            <p className="text-sm text-slate-500">
              Quick health check across all managed properties
            </p>
          </div>
          <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
            <Building2 size={15} />
            All Properties
          </button>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.name}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50/30"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950">
                  {property.name}
                </p>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {property.address}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {property.occupied}/{property.units} units occupied
                </p>
              </div>
              <div className="ml-4 flex shrink-0 flex-col items-end gap-2">
                <StatusBadge value={property.status} />
                <MiniDonut
                  value={Math.round((property.occupied / property.units) * 100)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <TenantRosterTable />

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <MaintenancePanel />
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <h3 className="text-xl font-semibold text-slate-950">
            Priority Follow-ups
          </h3>
          <p className="text-sm text-slate-500">Items requiring action today</p>
          <div className="mt-4 space-y-3">
            {[
              {
                title: "Contact Ari Kim — 5 days overdue",
                detail: "Unit 11C, Harbor Row — ₱3,900 outstanding",
                Icon: CreditCard,
                tone: "bg-rose-50 text-rose-700",
              },
              {
                title: "Contact Daniel Park — overdue",
                detail: "Unit 9E, The Meridian Lofts — ₱5,300 outstanding",
                Icon: CreditCard,
                tone: "bg-rose-50 text-rose-700",
              },
              {
                title: "Schedule electrician — Unit 3B",
                detail: "Bedroom outlet sparking — High priority",
                Icon: Wrench,
                tone: "bg-amber-50 text-amber-700",
              },
              {
                title: "Lease expiring Jun 19",
                detail: "Daniel Park — Unit 9E — send renewal notice",
                Icon: ClipboardList,
                tone: "bg-sky-50 text-sky-700",
              },
            ].map(({ title, detail, Icon, tone }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-200"
              >
                <div
                  className={clsx(
                    "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                    tone,
                  )}
                >
                  <Icon size={15} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">{title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-slate-950">
            Recent Activity
          </h3>
          <p className="text-sm text-slate-500">
            Latest tenant and property events
          </p>
        </div>
        <div className="space-y-2">
          {[
            {
              action: "Lease updated",
              detail: "Maya Santiago — Unit 3B renewal confirmed",
              time: "Today 9:42 AM",
              tone: "bg-emerald-50 text-emerald-700",
              Icon: ClipboardList,
            },
            {
              action: "Payment received",
              detail: "Liam Bennett — ₱5,100 for May",
              time: "Yesterday 4:10 PM",
              tone: "bg-emerald-50 text-emerald-700",
              Icon: CreditCard,
            },
            {
              action: "Maintenance submitted",
              detail: "Kitchen sink pressure drops — Unit 3B",
              time: "Jun 02",
              tone: "bg-amber-50 text-amber-700",
              Icon: Wrench,
            },
            {
              action: "Tenant flagged overdue",
              detail: "Ari Kim — Unit 11C — May rent unpaid",
              time: "Jun 01",
              tone: "bg-rose-50 text-rose-700",
              Icon: AlertTriangle,
            },
          ].map(({ action, detail, time, tone, Icon }) => (
            <div
              key={action + time}
              className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <div
                className={clsx(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                  tone,
                )}
              >
                <Icon size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950">{action}</p>
                <p className="text-sm text-slate-500">{detail}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
