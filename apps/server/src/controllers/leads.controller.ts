import { Request, Response } from "express";
import { supabase } from "../supabase";

export const listLeads = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data || []);
};

export const updateLead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, category, message, status, comments } =
    req.body ?? {};

  const payload: Record<string, any> = {};
  if (name !== undefined) payload.name = name;
  if (email !== undefined) payload.email = email;
  if (phone !== undefined) payload.phone = phone;
  if (category !== undefined) payload.category = category;
  if (message !== undefined) payload.message = message;
  if (status !== undefined) payload.status = status;
  if (comments !== undefined) payload.comments = comments;
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("leads")
    .update(payload)
    .eq("lead_id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};

export const deleteLead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq("lead_id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};

