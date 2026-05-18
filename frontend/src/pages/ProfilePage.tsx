import { ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../providers/AuthProvider";

export function ProfilePage() {
  const { profile, isDemo } = useAuth();

  if (!profile) return null;

  return (
    <div className="max-w-3xl space-y-5">
      <section>
        <p className="text-sm font-medium text-emerald-700">Account</p>
        <h2 className="text-2xl font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-gray-500">Supabase profile and role information for protected routes.</p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <UserRound size={26} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{profile.full_name}</h3>
            <p className="truncate text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-3">
            <dt className="text-xs font-medium uppercase text-gray-500">Role</dt>
            <dd className="mt-2">
              <Badge value={profile.role} />
            </dd>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <dt className="text-xs font-medium uppercase text-gray-500">Phone</dt>
            <dd className="mt-2 text-sm font-semibold">{profile.phone ?? "Not set"}</dd>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 sm:col-span-2">
            <dt className="text-xs font-medium uppercase text-gray-500">Access mode</dt>
            <dd className="mt-2 flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="text-emerald-700" size={18} />
              {isDemo ? "Demo workspace" : "Supabase authenticated"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
