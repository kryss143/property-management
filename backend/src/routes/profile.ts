import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../supabase.js";

export const profileRouter = Router();

profileRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", req.user?.id).single();

  if (error) {
    return res.status(404).json({ message: error.message });
  }

  res.json(data);
});

profileRouter.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  const { full_name, phone } = req.body;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ full_name, phone })
    .eq("id", req.user?.id)
    .select("*")
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data);
});
