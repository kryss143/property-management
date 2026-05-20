import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@property-management/shared";
import { supabaseAdmin, supabaseAuth } from "../supabase.js";

export interface AuthedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: UserRole;
  };
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  //console.log("authorization header:", req.headers.authorization);
  const token = req.headers.authorization?.replace("Bearer ", "");
  //console.log("token extracted:", token ? "present" : "missing");

  if (!token) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);
  //console.log("[auth] getUser error:", error?.message, "user:", data?.user?.id);

  if (error || !data.user) {
    return res.status(401).json({ message: "Invalid authorization token" });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  //console.log(
  //  "[auth] profile:",
  //  profile,
  //  "profileError:",
  //  profileError?.message,
  //);

  if (profileError || !profile) {
    return res.status(403).json({ message: "Profile is not configured" });
  }

  req.user = {
    id: data.user.id,
    email: data.user.email,
    role: profile.role as UserRole,
  };

  next();
}

export function requireRole(roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "You do not have access to this resource" });
    }

    next();
  };
}
