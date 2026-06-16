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
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res
        .status(401)
        .json({ error: { message: "Missing authorization token" } });
      return;
    }

    const { data, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError) {
      // Surface the real Supabase Auth error (e.g. "Token has expired", "invalid JWT")
      // instead of a generic message, so the client can act on it.
      res.status(401).json({
        error: {
          message: authError.message,
          ...(authError.code && { code: authError.code }),
        },
      });
      return;
    }

    if (!data.user) {
      res
        .status(401)
        .json({ error: { message: "Invalid authorization token" } });
      return;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      // Forward PostgREST errors (code, details, hint) to the global error handler
      // in server.ts so they're logged and returned in a consistent shape.
      next(profileError);
      return;
    }

    if (!profile) {
      res.status(403).json({ error: { message: "Profile is not configured" } });
      return;
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: profile.role as UserRole,
    };

    next();
  } catch (err) {
    // Unexpected errors (network failures, etc.) go to the global error handler
    next(err);
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res
        .status(403)
        .json({
          error: { message: "You do not have access to this resource" },
        });
      return;
    }

    next();
  };
}
