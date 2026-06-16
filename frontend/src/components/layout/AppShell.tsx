import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  Home,
  KeyRound,
  LogOut,
  Menu,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { useAuth } from "../../providers/AuthProvider";
import type { Profile } from "@property-management/shared";

// ─── Nav items ────────────────────────────────────────────────────────────────
// Dashboard path is role-specific so each role lands on their own page.
// The path is derived at render time from the profile role.

const staticNavItems = [
  {
    label: "Properties",
    path: "/properties",
    icon: Building2,
    roles: ["admin", "manager", "landlord"],
  },
  {
    label: "Units",
    path: "/units",
    icon: KeyRound,
    roles: ["admin", "manager", "landlord"],
  },
  {
    label: "Tenants",
    path: "/tenants",
    icon: UsersRound,
    roles: ["admin", "manager"],
  },
  {
    label: "Leases",
    path: "/leases",
    icon: ClipboardList,
    roles: ["admin", "manager", "landlord", "tenant"],
  },
  {
    label: "Payments",
    path: "/payments",
    icon: CreditCard,
    roles: ["admin", "manager", "landlord", "tenant"],
  },
  {
    label: "Maintenance",
    path: "/maintenance",
    icon: Wrench,
    roles: ["admin", "manager", "landlord", "tenant"],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    roles: ["admin", "manager", "landlord"],
  },
];

// Maps each role to their dashboard route
const roleDashboardPath: Record<string, string> = {
  admin: "/dashboard/admin",
  manager: "/dashboard/manager",
  landlord: "/dashboard/owner",
  tenant: "/dashboard/tenant",
};

// Maps each role to the header title shown on their dashboard
const roleDashboardTitle: Record<string, string> = {
  admin: "Admin Control Centre",
  manager: "Operations Dashboard",
  landlord: "Portfolio Overview",
  tenant: "My Home",
};

const roleBadgeColor: Record<string, string> = {
  admin: "bg-rose-100 text-rose-700",
  manager: "bg-blue-100 text-blue-700",
  landlord: "bg-amber-100 text-amber-700",
  tenant: "bg-emerald-100 text-emerald-700",
};

// Page titles for non-dashboard routes
const pathTitles: Record<string, string> = {
  "/properties": "Properties",
  "/units": "Units",
  "/tenants": "Tenants",
  "/leases": "Leases",
  "/payments": "Payments",
  "/maintenance": "Maintenance",
  "/reports": "Reports",
  "/profile": "Profile",
};

function getNavItems(role: Profile["role"] | undefined) {
  if (!role) return staticNavItems;
  return staticNavItems.filter((item) => item.roles.includes(role));
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell() {
  const { profile, signOut, isDemo } = useAuth();
  const location = useLocation();

  const dashboardPath = profile?.role
    ? (roleDashboardPath[profile.role] ?? "/dashboard")
    : "/dashboard";

  const navItems = getNavItems(profile?.role);

  // Build the full nav list with a role-aware Dashboard entry at the top
  const allNavItems = [
    {
      label: "Dashboard",
      path: dashboardPath,
      icon: Home,
      roles: ["admin", "manager", "landlord", "tenant"],
    },
    ...navItems,
  ];

  // Derive the header title from the current path
  const title = (() => {
    const isDashboardPath = Object.values(roleDashboardPath).includes(
      location.pathname,
    );
    if (isDashboardPath && profile?.role) {
      return roleDashboardTitle[profile.role] ?? "Dashboard";
    }
    return pathTitles[location.pathname] ?? "Dashboard";
  })();

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-24 text-gray-900 md:flex md:pb-0">
      {/* ── Sidebar ── */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white px-4 py-5 md:flex">
        <div className="mb-7 flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-600 text-white">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-base font-semibold">KeyNest</p>
            <p className="text-xs text-gray-500">Property workspace</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {allNavItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </nav>

        {profile?.role && (
          <div className="mt-6 px-2">
            <span
              className={clsx(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                roleBadgeColor[profile.role] ?? "bg-gray-100 text-gray-600",
              )}
            >
              {profile.role}
            </span>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase text-emerald-700 md:hidden">
                KeyNest
              </p>
              <h1 className="truncate text-xl font-semibold md:text-2xl">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {isDemo && (
                <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 sm:inline">
                  Demo data
                </span>
              )}
              <NavLink
                to="/profile"
                className="focus-ring flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 text-sm font-medium shadow-sm"
                title="Profile"
              >
                <UserRound size={18} />
                <span className="hidden sm:inline">{profile?.full_name}</span>
              </NavLink>
              <button
                className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-gray-200 bg-white shadow-sm"
                onClick={() => void signOut()}
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
              <button
                className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-gray-200 bg-white shadow-sm md:hidden"
                title="Menu"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 py-5 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-2 pb-3 pt-2 shadow-soft md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {allNavItems.slice(0, 8).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    "focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-500",
                  )
                }
              >
                <Icon size={18} />
                <span className="max-w-full truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function NavItem({ label, path, icon: Icon }: (typeof staticNavItems)[number]) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        clsx(
          "focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
          isActive
            ? "bg-emerald-50 text-emerald-700"
            : "text-gray-600 hover:bg-gray-50",
        )
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}
