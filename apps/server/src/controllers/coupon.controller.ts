import { Request, Response } from "express";
import { supabase } from "../supabase";

export const getCoupons = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("coupons").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data || []);
};

export const createCoupon = async (req: Request, res: Response) => {
  const { coupon_code, discount_type, discount_value, expiry_date } = req.body;
  const { data, error } = await supabase
    .from("coupons")
    .insert([{ coupon_code, discount_type, discount_value, expiry_date }])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
};

export const updateCoupon = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { coupon_code, discount_type, discount_value, expiry_date } = req.body;
  const { data, error } = await supabase
    .from("coupons")
    .update({ coupon_code, discount_type, discount_value, expiry_date })
    .eq("coupon_id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
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
