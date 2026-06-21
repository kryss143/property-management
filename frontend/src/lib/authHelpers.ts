import { Profile } from "@property-management/shared";
import { supabase } from "./supabase";

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
