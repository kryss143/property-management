import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import type { UserRole } from "@property-management/shared";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { ManagerDashboard } from "./pages/dashboard/ManagerDashboard";
import { OwnerDashboard } from "./pages/dashboard/OwnerDashboard";
import { TenantDashboard } from "./pages/dashboard/TenantDashboard";
import { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import { ResourcePage } from "./pages/ResourcePage";
import { ReportsPage } from "./pages/ReportsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { useAuth } from "./providers/AuthProvider";
import { HomePage } from "./pages/HomePage";

const roleDashboardPath: Record<UserRole, string> = {
  admin: "/dashboard/admin",
  manager: "/dashboard/manager",
  tenant: "/dashboard/tenant",
  landlord: "/dashboard/owner",
};

function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) {
  const { profile } = useAuth();

  if (!profile || !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function ProtectedApp() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4 text-sm text-gray-600">
        Loading workspace...
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace />;

  // AppShell must render <Outlet /> so nested routes render inside the shell
  return <AppShell />;
}

function DashboardRedirect() {
  const { profile } = useAuth();

  if (!profile) return <Navigate to="/login" replace />;

  const map: Record<string, string> = roleDashboardPath;

  return <Navigate to={map[profile.role] ?? "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes — no AppShell */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes — AppShell wraps all children via Outlet */}
      <Route element={<ProtectedApp />}>
        {/* /dashboard redirects to the role-specific page */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        <Route path="/dashboard/admin" element={
          <RequireRole roles={["admin"]}>
            <AdminDashboard />
          </RequireRole>
        } />
        <Route path="/dashboard/manager" element={
          <RequireRole roles={["manager"]}>
            <ManagerDashboard />
          </RequireRole>
        } />
        <Route path="/dashboard/tenant" element={
          <RequireRole roles={["tenant"]}>
            <TenantDashboard />
          </RequireRole>
        } />
        <Route path="/dashboard/owner" element={
          <RequireRole roles={["landlord"]}>
            <OwnerDashboard />
          </RequireRole>
        } />

        <Route
          path="/properties"
          element={<ResourcePage type="properties" />}
        />
        <Route path="/units" element={<ResourcePage type="units" />} />
        <Route path="/tenants" element={<ResourcePage type="tenants" />} />
        <Route path="/leases" element={<ResourcePage type="leases" />} />
        <Route path="/payments" element={<ResourcePage type="payments" />} />
        <Route
          path="/maintenance"
          element={<ResourcePage type="maintenance-requests" />}
        />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
