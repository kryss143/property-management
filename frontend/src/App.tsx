import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ResourcePage } from "./pages/ResourcePage";
import { ReportsPage } from "./pages/ReportsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { useAuth } from "./providers/AuthProvider";

function ProtectedApp() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4 text-sm text-gray-600">
        Loading workspace...
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/properties" element={<ResourcePage type="properties" />} />
        <Route path="/units" element={<ResourcePage type="units" />} />
        <Route path="/tenants" element={<ResourcePage type="tenants" />} />
        <Route path="/leases" element={<ResourcePage type="leases" />} />
        <Route path="/payments" element={<ResourcePage type="payments" />} />
        <Route path="/maintenance" element={<ResourcePage type="maintenance-requests" />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}
