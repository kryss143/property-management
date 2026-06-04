import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@property-management/shared";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

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
  full_name: "Jordan Manager",
  email: "manager@example.com",
  phone: "555-0110",
  role: "manager",
  created_at: new Date().toISOString(),
};

const SUPABASE_TIMEOUT_MS = 8000;

async function withTimeout<T>(
  promise: PromiseLike<T>,
  message: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(message)),
      SUPABASE_TIMEOUT_MS,
    );
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await withTimeout(
    supabase.from("profiles").select("*").eq("id", userId).single(),
    "Timed out loading profile",
  );
  if (error) return null;
  return data as Profile;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // FIX 1: always start as false — demo mode must be explicitly chosen from the login page
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    function onAuthExpired() {
      console.warn("[auth] Session expired (received auth:expired event)");
      setSession(null);
      setProfile(null);
      setIsDemo(false);
      if (isSupabaseConfigured) {
        void supabase.auth.signOut().catch(() => {
          /* ignore */
        });
      }
      navigate("/login", { replace: true });
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
      // FIX 2: don't auto-login as demo — just stop loading so ProtectedApp
      // redirects to /login where the user can choose "Use demo" themselves
      setLoading(false);
      return;
    }

    let active = true;

    async function bootstrapAuth() {
      try {
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          "Timed out loading Supabase session",
        );

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
          navigate("/login", { replace: true });
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
          setProfile(
            nextSession?.user ? await loadProfile(nextSession.user.id) : null,
          );
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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setIsDemo(false);
      },
      async signUp({ email, password, fullName, role }) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role,
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            role,
          });
        }
        setIsDemo(false);
      },
      useDemo() {
        setProfile(demoProfile);
        setSession(null);
        setIsDemo(true);
      },
      async signOut() {
        if (isSupabaseConfigured) {
          await supabase.auth.signOut();
        }
        setSession(null);
        setProfile(null);
        setIsDemo(false);
      },
    }),
    [isDemo, loading, profile, session],
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
