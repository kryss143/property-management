import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { Building2, Loader2 } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";

export function LoginPage() {
  const { profile, signIn, signUp, useDemo } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("manager@example.com");
  const [password, setPassword] = useState("password123");
  const [fullName, setFullName] = useState("Jordan Manager");
  const [role, setRole] = useState<"manager" | "landlord" | "tenant">("manager");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (profile) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp({ email, password, fullName, role });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-4 py-8 sm:grid sm:place-items-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-soft sm:grid sm:grid-cols-[1.05fr_0.95fr]">
        <section className="bg-emerald-700 px-5 py-8 text-white sm:px-8 sm:py-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/15">
              <Building2 size={23} />
            </div>
            <div>
              <p className="text-lg font-semibold">KeyNest</p>
              <p className="text-sm text-emerald-50">Property Management System</p>
            </div>
          </div>
          <h1 className="max-w-md text-3xl font-semibold leading-tight sm:text-4xl">Manage properties, tenants, leases, and rent from one workspace.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50">
            Built mobile-first for managers in the field and clear enough for owners and tenants to use every day.
          </p>
          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            {["Role-aware access", "Rent tracking", "Maintenance workflows", "Owner-ready reports"].map((item) => (
              <div key={item} className="rounded-lg bg-white/12 px-3 py-3 font-medium">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-7 sm:px-8 sm:py-10">
          <div className="mb-5 flex rounded-lg bg-gray-100 p-1">
            <button
              className={`focus-ring flex-1 rounded-md px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-white shadow-sm" : "text-gray-500"}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`focus-ring flex-1 rounded-md px-3 py-2 text-sm font-semibold ${mode === "signup" ? "bg-white shadow-sm" : "text-gray-500"}`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <>
                <label className="block text-sm font-medium text-gray-700">
                  Full name
                  <input className="focus-ring mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                  <select className="focus-ring mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
                    <option value="manager">Property Manager</option>
                    <option value="landlord">Landlord / Owner</option>
                    <option value="tenant">Tenant</option>
                  </select>
                </label>
              </>
            ) : null}

            <label className="block text-sm font-medium text-gray-700">
              Email
              <input className="focus-ring mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Password
              <input className="focus-ring mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>

            {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

            <button className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" size={18} /> : null}
              {mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <button className="focus-ring mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700" onClick={useDemo}>
            Continue with demo data
          </button>
        </section>
      </div>
    </div>
  );
}
