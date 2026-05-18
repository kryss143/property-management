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

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Missing authorization token" });
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ message: "Invalid authorization token" });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ message: "Profile is not configured" });
  }

  req.user = {
    id: data.user.id,
    email: data.user.email,
    role: profile.role as UserRole
  };

  next();
}

export function requireRole(roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }

    next();
  };
}
