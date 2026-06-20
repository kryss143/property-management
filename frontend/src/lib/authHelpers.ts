import { Profile } from "@property-management/shared";
import { supabase } from "./supabase";

const SUPABASE_TIMEOUT_MS = 8000;

export async function withTimeout<T>(
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

export function profileSetupError(): Error {
  return Object.assign(
    new Error("Your account isn't set up yet. Contact your administrator."),
    { status: 403 },
  );
}

export async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // console.log("Profile data:", data);
  // console.log("Profile error:", error);

  if (error) {
    console.error("[profile] load error:", error);
    return null;
  }

  if (!data) {
    console.warn("[profile] not found for user:", userId);
    return null;
  }

  return data;
}
