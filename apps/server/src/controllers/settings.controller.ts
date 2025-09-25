import { Request, Response } from "express";
import { supabase } from "../supabase";

const CONTACT_EMAIL_KEY = "contact_recipient_email";

export const getContactRecipientEmail = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", CONTACT_EMAIL_KEY)
      .maybeSingle();

    if (error) throw error;

    const fallback = process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_DEFAULT_TO || "connect@bastionresearch.in";
    return res.status(200).json({ email: data?.value || fallback });
  } catch (e: any) {
    const fallback = process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_DEFAULT_TO || "connect@bastionresearch.in";
    return res.status(200).json({ email: fallback });
  }
};

export const updateContactRecipientEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const { data, error } = await supabase
      .from("settings")
      .upsert({ key: CONTACT_EMAIL_KEY, value: email }, { onConflict: "key" })
      .select()
      .maybeSingle();

    if (error) throw error;
    return res.status(200).json({ email: data?.value || email });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to update contact email" });
  }
};

