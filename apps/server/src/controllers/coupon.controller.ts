import { Request, Response } from "express";
import { supabase } from "../supabase/supabase";

export const getCoupons = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("coupons").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (data && data.length > 0) {
    return res.status(200).json(data);
  }
  const dummyData = [
    {
      coupon_id: 1,
      coupon_code: "SUMMER2024",
      discount_type: "percentage",
      discount_value: 10,
      expiry_date: "2024-08-31",
    },
    {
      coupon_id: 2,
      coupon_code: "WELCOME10",
      discount_type: "fixed",
      discount_value: 10,
      expiry_date: "2024-12-31",
    },
  ];
  res.status(200).json(dummyData);
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
