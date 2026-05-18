import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
  signUp: (payload: { email: string; password: string; fullName: string; role: Profile["role"] }) => Promise<void>;
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
  created_at: new Date().toISOString()
};

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) return null;
  return data as Profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setProfile(demoProfile);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setProfile(data.session?.user ? await loadProfile(data.session.user.id) : null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setProfile(nextSession?.user ? await loadProfile(nextSession.user.id) : null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      session,
      loading,
      token: session?.access_token,
      isDemo,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
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
              role
            }
          }
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            role
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
      }
    }),
    [isDemo, loading, profile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
