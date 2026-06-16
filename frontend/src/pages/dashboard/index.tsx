import {
  Shield,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "../../providers/AuthProvider";
import { TenantDashboard } from "./TenantDashboard";
import { OwnerDashboard } from "./OwnerDashboard";
import { ManagerDashboard } from "./ManagerDashboard";
import { AdminDashboard } from "./AdminDashboard";

function DemoContent() {
  const [view, setView] = useState<"tenant" | "landlord" | "manager" | "admin">(
    "tenant",
  );
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <div
          className="grid grid-cols-4 rounded-lg bg-slate-100 p-1"
          role="tablist"
          aria-label="Dashboard view"
        >
          {(
            [
              ["tenant", UserRound, "Tenant"],
              ["landlord", ShieldCheck, "Landlord"],
              ["manager", UsersRound, "Manager"],
              ["admin", Shield, "Admin"],
            ] as const
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={view === key}
              onClick={() => setView(key)}
              className={clsx(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-500",
                view === key
                  ? key === "admin"
                    ? "bg-slate-950 text-amber-300 shadow-sm"
                    : "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-950",
              )}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
      </div>
      {view === "tenant" && <TenantDashboard />}
      {view === "landlord" && <OwnerDashboard />}
      {view === "manager" && <ManagerDashboard />}
      {view === "admin" && <AdminDashboard />}
    </div>
  );
}

export function DashboardPage() {
  const { profile } = useAuth();
  const role = profile?.role;

  const wrapper = (children: React.ReactNode) => (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-[1600px]">{children}</div>
    </div>
  );

  if (role === "tenant") return wrapper(<TenantDashboard />);
  if (role === "landlord") return wrapper(<OwnerDashboard />);
  if (role === "manager") return wrapper(<ManagerDashboard />);
  if (role === "admin") return wrapper(<AdminDashboard />);

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="sticky top-[73px] z-10 rounded-lg border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur md:top-[81px]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 px-2">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-amber-300">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-950">Dashboard demo</p>
                <p className="text-sm text-slate-500">
                  Switch between all role experiences
                </p>
              </div>
            </div>
            <DemoContent />
          </div>
        </div>
      </div>
    </div>
  );
}
