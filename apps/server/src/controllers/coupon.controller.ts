import { Request, Response } from "express";
import { supabase } from "../supabase";

export const getCoupons = async (_: any, res: Response) => {
  const { data, error } = await supabase.from("coupons").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data || []);
};

export const createCoupon = async (req: Request, res: Response) => {
  const { coupon_code, discount_type, discount_value, expiry_date, max_uses, active } = req.body;
  const { data, error } = await supabase
    .from("coupons")
    .insert([{ coupon_code, discount_type, discount_value, expiry_date, active, max_uses }])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
};

export const updateCoupon = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { coupon_code, discount_type, discount_value, expiry_date, max_uses, active } = req.body;
  const { data, error } = await supabase
    .from("coupons")
    .update({ coupon_code, discount_type, discount_value, expiry_date, max_uses, active })
    .eq("coupon_id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

export const createBulkCoupons = async (req: Request, res: Response) => {
  const { codes } = req.body as { codes?: string[] };

  if (!Array.isArray(codes) || codes.length === 0) {
    return res
      .status(400)
      .json({ error: "codes must be a non-empty array of strings" });
  }

  // Normalize: trim, uppercase (for PAN), remove blanks and duplicates
  const normalized = Array.from(
    new Set(
      codes
        .map((c) => (typeof c === "string" ? c.trim().toUpperCase() : ""))
        .filter((c) => c.length > 0)
    )
  );

  if (normalized.length === 0) {
    return res
      .status(400)
      .json({ error: "No valid coupon codes provided" });
  }

  const payload = normalized.map((coupon_code) => ({
    coupon_code,
    discount_type: "percentage",
    discount_value: 100,
    expiry_date: null,
    active: true,
    max_uses: 1,
  }));

  const { data, error } = await supabase
    .from("coupons")
    .insert(payload)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
};

export const deleteCoupon = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("coupons")
    .delete()
    .eq("coupon_id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

export const validateCoupon = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("coupon_code", code)
    .eq("active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return res.status(404).json({ error: "Coupon not found" });
    }
    return res.status(500).json({ error: error.message });
  }

  // Check if coupon is expired
  if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
    return res.status(400).json({ error: "Coupon has expired" });
  }

  res.status(200).json(data);
};
