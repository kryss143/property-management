import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@property-management/shared";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { profileSetupError, loadProfile } from "../lib/authHelpers";

interface AuthContextValue {
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  token?: string;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: {
    email: string;
    password: string;
    fullName: string;
    role: Profile["role"];
  }) => Promise<void>;
  useDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const demoProfile: Profile = {
  id: "demo-user",
  full_name: "Alex Admin",
  email: "admin@example.com",
  phone: "555-0110",
  role: "admin",
  created_at: new Date().toISOString(),
};

const roleDashboardPath: Record<Profile["role"], string> = {
  admin: "/dashboard/admin",
  manager: "/dashboard/manager",
  tenant: "/dashboard/tenant",
  landlord: "/dashboard/owner",
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDemo, setIsDemo] = useState(false);

  const authGenerationRef = useRef(0);

  useEffect(() => {
    function onAuthExpired() {
      console.warn("[auth] Session expired (received auth:expired event)");
      authGenerationRef.current += 1;
      setSession(null);
      setProfile(null);
      setIsDemo(false);
      if (isSupabaseConfigured) {
        void supabase.auth.signOut().catch(() => {
          /* ignore */
        });
      }
      navigate("/", { replace: true });
    }

    window.addEventListener("auth:expired", onAuthExpired as EventListener);
    return () => {
      window.removeEventListener(
        "auth:expired",
        onAuthExpired as EventListener,
      );
    };
  }, [isSupabaseConfigured, navigate]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    const SESSION_TIMEOUT_MS = 6000;

    function getSessionWithTimeout() {
      const requestGeneration = authGenerationRef.current;

      return new Promise<Awaited<ReturnType<typeof supabase.auth.getSession>>>(
        (resolve) => {
          let settled = false;

          const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            console.warn(
              "[auth] getSession slow after inactivity — showing logged-out state, still checking in background",
            );
            resolve({ data: { session: null }, error: null } as Awaited<
              ReturnType<typeof supabase.auth.getSession>
            >);
          }, SESSION_TIMEOUT_MS);

          supabase.auth.getSession().then((result) => {
            clearTimeout(timer);

            if (!settled) {
              settled = true;
              resolve(result);
              return;
            }

            // Timeout already fired and bootstrapAuth moved on with "no
            // session" — but the real call just came back. Only restore
            // it if nothing has explicitly signed the user out since this
            // request started; otherwise we'd silently undo a sign-out.
            if (
              !active ||
              !result.data.session ||
              authGenerationRef.current !== requestGeneration
            ) {
              return;
            }

            console.info(
              "[auth] Slow getSession resolved successfully — restoring session",
            );
            setSession(result.data.session);
            void loadProfile(result.data.session.user.id).then((p) => {
              if (active && authGenerationRef.current === requestGeneration) {
                setProfile(p);
              }
            });
          });
        },
      );
    }

    async function bootstrapAuth() {
      try {
        const { data } = await getSessionWithTimeout();

        if (!active) return;

        setSession(data.session);
        setProfile(
          data.session?.user ? await loadProfile(data.session.user.id) : null,
        );
      } catch (error) {
        console.error("[auth] Failed to load Supabase session", error);
        if (active) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void bootstrapAuth();

    const { data } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        try {
          setSession(nextSession);

          if (_event === "SIGNED_OUT" || !nextSession) {
            setProfile(null);
            setIsDemo(false);
            return;
          }

          if (_event === "SIGNED_IN" || _event === "INITIAL_SESSION") {
            if (nextSession.user) {
              const nextProfile = await loadProfile(nextSession.user.id);
              setProfile(nextProfile);
            }
          }
        } catch (error) {
          console.error("[auth] Failed to refresh profile", error);
          setProfile(null);
          navigate("/login", { replace: true });
        }
      },
    );

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      session,
      loading,
      token: session?.access_token,
      isDemo,
      async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setIsDemo(false);

        const nextProfile = data.user ? await loadProfile(data.user.id) : null;

        if (!nextProfile) {
          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);
          throw profileSetupError();
        }

        setProfile(nextProfile);
        navigate(roleDashboardPath[nextProfile.role] ?? "/dashboard", {
          replace: true,
        });
      },

      async signUp({ email, password, fullName, role }) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            role,
          });

          if (role === "tenant") {
            const { error: tenantError } = await supabase
              .from("tenants")
              .upsert(
                {
                  profile_id: data.user.id,
                  full_name: fullName,
                  email,
                  phone: null,
                  emergency_contact: null,
                },
                { onConflict: "profile_id" },
              );

            if (tenantError) {
              console.error(
                "[auth] Failed to create tenant record",
                tenantError,
              );
            }
          }
        }

        setIsDemo(false);

        if (!data.session) {
          return;
        }

        const nextProfile = data.user ? await loadProfile(data.user.id) : null;
        setProfile(nextProfile);
        navigate(roleDashboardPath[role] ?? "/dashboard", { replace: true });
      },
      useDemo() {
        setProfile(demoProfile);
        setSession(null);
        setIsDemo(true);
      },
      async signOut() {
        navigate("/", { replace: true });

        authGenerationRef.current += 1;

        if (isSupabaseConfigured) {
          await supabase.auth.signOut();
        }
        setSession(null);
        setProfile(null);
        setIsDemo(false);
      },
    }),
    [isDemo, loading, navigate, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
