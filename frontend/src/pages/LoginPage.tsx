import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { AlertCircle, Building2, Loader2, MailCheck } from "lucide-react";
import { z } from "zod";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const signupSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required.")
    .max(80, "Name is too long."),
  role: z.enum(["tenant", "manager", "landlord"], {
    errorMap: () => ({ message: "Please choose a role." }),
  }),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

type LoginFields = z.infer<typeof loginSchema>;
type SignupFields = z.infer<typeof signupSchema>;
type FieldErrors = Partial<Record<keyof (LoginFields & SignupFields), string>>;

type SignupRole = "" | "tenant" | "manager" | "landlord";

// Supabase Auth error codes → human-friendly messages
const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Incorrect email or password.",
  email_not_confirmed: "Please verify your email before signing in.",
  user_not_found: "No account found with that email.",
  email_exists: "An account with that email already exists.",
  weak_password: "Password is too weak. Use at least 8 characters.",
  over_request_rate_limit:
    "Too many attempts. Please wait a moment and try again.",
  user_banned: "This account has been suspended. Contact support.",
  session_not_found: "Your session has expired. Please sign in again.",
  token_expired: "Your session has expired. Please sign in again.",
};

// HTTP status codes → fallback messages when no Supabase code is present
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Bad request — please check your details and try again.",
  401: "Incorrect email or password.",
  403: "Your account isn't set up yet. Contact your administrator.",
  404: "Service not found. Please try again later.",
  422: "Invalid details — please check your email and password.",
  429: "Too many attempts. Please wait a moment and try again.",
  500: "Server error. Please try again in a few moments.",
  502: "Service unavailable. Please try again later.",
  503: "Service unavailable. Please try again later.",
};

interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

function parseAuthError(err: unknown): AuthError {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (e.error && typeof e.error === "object") {
      const inner = e.error as Record<string, unknown>;
      return {
        message: String(inner.message ?? "Authentication failed"),
        code: inner.code ? String(inner.code) : undefined,
        status: inner.status ? Number(inner.status) : undefined,
      };
    }
    return {
      message: String(e.message ?? "Authentication failed"),
      code: e.code ? String(e.code) : undefined,
      status: e.status ? Number(e.status) : undefined,
    };
  }
  return { message: "Authentication failed" };
}

function friendlyError(err: unknown): { headline: string; detail?: string } {
  const { message, code, status } = parseAuthError(err);
  if (code && SUPABASE_ERROR_MESSAGES[code]) {
    return { headline: SUPABASE_ERROR_MESSAGES[code] };
  }
  if (status && HTTP_STATUS_MESSAGES[status]) {
    return {
      headline: HTTP_STATUS_MESSAGES[status],
      detail: message !== HTTP_STATUS_MESSAGES[status] ? message : undefined,
    };
  }
  return { headline: message };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
      <AlertCircle size={12} className="shrink-0" />
      {message}
    </p>
  );
}

export function LoginPage() {
  const { profile, loading, signIn, signUp, useDemo } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("manager@example.com");
  const [password, setPassword] = useState("password123");
  const [fullName, setFullName] = useState("Jordan Manager");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [role, setRole] = useState<SignupRole>("");

  const [serverError, setServerError] = useState<{
    headline: string;
    detail?: string;
  } | null>(null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  const showDemoLogin = import.meta.env.DEV;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4 text-sm text-gray-600">
        Loading...
      </div>
    );
  }

  if (profile) {
    const roleRoutes: Record<string, string> = {
      admin: "/dashboard/admin",
      manager: "/dashboard/manager",
      tenant: "/dashboard/tenant",
      landlord: "/dashboard/owner",
    };

    return <Navigate to={roleRoutes[profile.role] ?? "/dashboard"} replace />;
  }

  // Clear a single field error as soon as the user edits that field
  function clearField(field: keyof FieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setServerError(null);

    const schema = mode === "login" ? loginSchema : signupSchema;
    const raw =
      mode === "login"
        ? { email, password }
        : { email, password, fullName, role };

    const result = schema.safeParse(raw);

    if (!result.success) {
      const flat: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!flat[key]) flat[key] = issue.message; // first error per field
      }
      setFieldErrors(flat);
      return;
    }

    setFieldErrors({});
    setBusy(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp({
          email,
          password,
          fullName,
          role: role as Exclude<SignupRole, "">,
        });
        setSignupSuccess(true);
      }
    } catch (err) {
      setServerError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  const inputClass = (field: keyof FieldErrors) =>
    `focus-ring mt-1 w-full rounded-lg border px-3 py-2.5 ${
      fieldErrors[field] ? "border-rose-400 bg-rose-50/40" : "border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-4 py-8 sm:grid sm:place-items-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-soft sm:grid sm:grid-cols-[1.05fr_0.95fr]">
        {/* ── Left panel (unchanged) ── */}
        <section className="bg-emerald-700 px-5 py-8 text-white sm:px-8 sm:py-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/15">
              <Building2 size={23} />
            </div>
            <div>
              <p className="text-lg font-semibold">KeyNest</p>
              <p className="text-sm text-emerald-50">
                Property Management System
              </p>
            </div>
          </div>
          <h1 className="max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
            Manage properties, tenants, leases, and rent from one workspace.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50">
            Built mobile-first for managers in the field and clear enough for
            owners and tenants to use every day.
          </p>
          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            {[
              "Role-aware access",
              "Rent tracking",
              "Maintenance workflows",
              "Owner-ready reports",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg bg-white/12 px-3 py-3 font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* ── Right panel: form ── */}
        <section className="px-5 py-7 sm:px-8 sm:py-10">
          <div className="mb-5 flex rounded-lg bg-gray-100 p-1">
            <button
              className={`focus-ring flex-1 rounded-md px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-white shadow-sm" : "text-gray-500"}`}
              onClick={() => {
                setMode("login");
                setFieldErrors({});
                setServerError(null);
              }}
            >
              Login
            </button>
            <button
              className={`focus-ring flex-1 rounded-md px-3 py-2 text-sm font-semibold ${mode === "signup" ? "bg-white shadow-sm" : "text-gray-500"}`}
              onClick={() => {
                setMode("signup");
                setFieldErrors({});
                setServerError(null);
              }}
            >
              Sign up
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full name
                    <input
                      className={inputClass("fullName")}
                      // value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearField("fullName");
                      }}
                      placeholder="Enter full name"
                    />
                  </label>
                  <FieldError message={fieldErrors.fullName} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                    <select
                      className={inputClass("role")}
                      // value={role}
                      onChange={(e) => {
                        setRole(e.target.value as SignupRole);
                        clearField("role");
                      }}
                    >
                      <option value="" disabled>
                        Choose role
                      </option>
                      <option value="manager">Property Manager</option>
                      <option value="landlord">Owner</option>
                      <option value="tenant">Tenant</option>
                    </select>
                  </label>
                  <FieldError message={fieldErrors.role} />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
                <input
                  className={inputClass("email")}
                  type="email"
                  // value={email}
                  placeholder="Enter email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearField("email");
                  }}
                />
              </label>
              <FieldError message={fieldErrors.email} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
                <input
                  className={inputClass("password")}
                  type="password"
                  // value={password}
                  placeholder="Enter password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearField("password");
                  }}
                />
              </label>
              <FieldError message={fieldErrors.password} />
            </div>

            {serverError && (
              <div className="flex gap-2.5 rounded-lg bg-rose-50 px-3 py-2.5 text-rose-700">
                <AlertCircle className="mt-0.5 shrink-0" size={16} />
                <div className="text-sm">
                  <p className="font-medium">{serverError.headline}</p>
                  {serverError.detail && (
                    <p className="mt-0.5 text-rose-600/80">
                      {serverError.detail}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={busy}
            >
              {busy && <Loader2 className="animate-spin" size={18} />}
              {mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          {signupSuccess && (
            <div className="mt-4 flex gap-2.5 rounded-lg bg-emerald-50 px-3 py-3 text-emerald-800">
              <MailCheck className="mt-0.5 shrink-0" size={16} />
              <div className="text-sm">
                <p className="font-medium">Check your inbox</p>
                <p className="mt-0.5 text-emerald-700/80">
                  We sent a verification link to{" "}
                  <span className="font-medium">{email}</span>. Click it to
                  activate your account before signing in.
                </p>
              </div>
            </div>
          )}
          {showDemoLogin && (
            <button
              className="focus-ring mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700"
              onClick={() => {
                useDemo();
              }}
            >
              Continue with demo data
            </button>
          )}
          <p className="mt-4 text-center text-sm text-gray-600">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              className="text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline"
              type="button"
              onClick={() => {
                setServerError(null);
                setFieldErrors({});
                setMode(mode === "login" ? "signup" : "login");
              }}
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}
