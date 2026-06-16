import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Download,
  Wrench,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../../providers/AuthProvider";
import {
  AlertBanner,
  AnimatedValue,
  DashboardTopBar,
  MaintenancePanel,
  PaymentTable,
  StatCard,
  formatDate,
  money,
} from "./shared";

export function TenantDashboard() {
  const today = new Date();
  const { profile } = useAuth();

  return (
    <div className="space-y-5">
      <DashboardTopBar
        title="My Dashboard"
        subtitle="Your rent, lease, and maintenance at a glance."
        action="Pay Rent"
        badgeCount={3}
      />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:p-6">
          <div>
            <p className="text-sm font-medium text-amber-300">
              {formatDate(today)}
            </p>
            <h3 className="mt-2 text-3xl font-semibold md:text-4xl">
              Good morning, {profile?.full_name}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Unit 3B at Aurelia Heights, 18 Valero Street. Your lease renewal
              window opens soon, and your next rent statement is ready for
              review.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm text-slate-300">Lease countdown</p>
            <p className="mt-2 text-4xl font-semibold text-amber-300">
              <AnimatedValue value={87} /> days
            </p>
            <p className="mt-1 text-sm text-slate-300">until lease renewal</p>
          </div>
        </div>
      </section>

      <AlertBanner
        tone="amber"
        title="Lease renewal notice"
        detail="Your landlord requested renewal confirmation by June 20, 2026."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Next Rent Due"
          value={<AnimatedValue value={4200} prefix="$" />}
          detail="Due Jun 05 - 1 day left"
          trend={0}
          icon={CreditCard}
          tone="text-amber-700"
        />
        <StatCard
          label="Last Payment"
          value={<AnimatedValue value={4200} prefix="$" />}
          detail="Paid May 03"
          trend={2.1}
          icon={CheckCircle2}
          tone="text-emerald-700"
        />
        <StatCard
          label="Open Maintenance"
          value={<AnimatedValue value={3} />}
          detail="1 high priority"
          trend={-12}
          icon={Wrench}
          tone="text-sky-700"
        />
        <StatCard
          label="Lease End Date"
          value="Aug 31"
          detail="2026 renewal cycle"
          trend={6}
          icon={CalendarClock}
          tone="text-violet-700"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <PaymentTable />
        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-950">
                Lease Summary
              </h3>
              <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                <Download size={16} />
                Download lease
              </button>
            </div>
            <div className="grid gap-3 text-sm">
              {[
                ["Unit", "3B - 120 sqm - 2BR / 1BA"],
                ["Lease Term", "Sep 01, 2025 to Aug 31, 2026"],
                ["Monthly Rent", money(4200)],
                ["Security Deposit Held", money(8400)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <h3 className="text-xl font-semibold text-slate-950">
              Notices & Announcements
            </h3>
            <div className="mt-4 space-y-3">
              {[
                ["Lobby polish scheduled", "Tomorrow, 9 AM to 12 PM", true],
                ["Pool access cards updated", "Pick up at concierge", true],
                ["Quarterly pest control", "Completed May 27", false],
              ].map(([title, detail, unread]) => (
                <div
                  key={title as string}
                  className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"
                >
                  <span
                    className={clsx(
                      "mt-1 h-2.5 w-2.5 rounded-full",
                      unread ? "bg-amber-500" : "bg-slate-300",
                    )}
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="text-sm text-slate-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <MaintenancePanel />
    </div>
  );
}
