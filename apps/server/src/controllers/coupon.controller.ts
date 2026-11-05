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

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Coupon code is required" });
  }

  const normalized = code.trim().toUpperCase();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .ilike("coupon_code", normalized)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: "Invalid coupon code" });
  }

  // Check if coupon usage limit reached
  const maxUses = typeof data.max_uses === "number" ? data.max_uses : null;
  const usedCount = typeof data.used_count === "number" ? data.used_count : 0;

  if (maxUses !== null && usedCount >= maxUses) {
    // Auto-deactivate coupon if it reached max uses
    if (data.active) {
      await supabase
        .from("coupons")
        .update({ active: false })
        .eq("coupon_id", data.coupon_id);
    }
    return res.status(400).json({ error: "Coupon usage limit reached" });
  }

  if (!data.active) {
    return res.status(400).json({ error: "Coupon is no longer active" });
  }

  // Check if coupon is expired
  if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
    return res.status(400).json({ error: "Coupon has expired" });
  }

  res.status(200).json(data);
};

export const incrementCouponUsage = async (couponCode: string) => {
  if (!couponCode || !couponCode.trim()) return;
  const normalized = couponCode.trim().toUpperCase();

  // Fetch current coupon data
  const { data: coupon, error: fetchError } = await supabase
    .from("coupons")
    .select("coupon_id, coupon_code, used_count, max_uses, active")
    .ilike("coupon_code", normalized)
    .maybeSingle();

  if (fetchError || !coupon) {
    console.warn(`Coupon ${couponCode} not found for incrementing usage`);
    return;
  }

  const currentCount = typeof coupon.used_count === "number" ? coupon.used_count : 0;
  const newUsedCount = currentCount + 1;
  const shouldDeactivate =
    typeof coupon.max_uses === "number" && newUsedCount >= coupon.max_uses;

  // Update used_count and active status if needed
  const { error: updateError } = await supabase
    .from("coupons")
    .update({
      used_count: newUsedCount,
      active: shouldDeactivate ? false : coupon.active,
      updated_at: new Date().toISOString(),
    })
    .eq("coupon_id", coupon.coupon_id);

  if (updateError) {
    console.error(`Failed to update coupon usage for ${couponCode}:`, updateError.message);
    throw new Error(`Failed to update coupon usage: ${updateError.message}`);
  }
};
