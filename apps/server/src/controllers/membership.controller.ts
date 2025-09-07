import { Request, Response } from "express";
import { supabase } from "../supabase";

export const getMembershipPlans = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("membership_plans").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (data && data.length > 0) {
    return res.status(200).json(data);
  }
  const dummyData = [
    {
      plan_id: 1,
      plan_name: "Gold",
      plan_type: "Subscription",
      members: 0,
      wp_role: "gold_member",
      price_amount: 99.99,
      currency: "USD",
      duration_months: 12,
    },
    {
      plan_id: 2,
      plan_name: "Silver",
      plan_type: "Subscription",
      members: 0,
      wp_role: "silver_member",
      price_amount: 49.99,
      currency: "USD",
      duration_months: 12,
    },
  ];
  res.status(200).json(dummyData);
};

export const getSubscriptions = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("subscriptions").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (data && data.length > 0) {
    return res.status(200).json(data);
  }
  const dummyData = [
    {
      membership_id: 1,
      username: "johndoe",
      name: "John Doe",
      start_date: "2023-01-15",
      expire_next_renewal: "2024-01-15",
      amount: 99.99,
      currency: "USD",
      payment_type: "Stripe",
      transaction_id: 12345,
      status: "Active",
    },
    {
      membership_id: 2,
      username: "janesmith",
      name: "Jane Smith",
      start_date: "2023-03-20",
      expire_next_renewal: "2024-03-20",
      amount: 49.99,
      currency: "USD",
      payment_type: "PayPal",
      transaction_id: 67890,
      status: "Active",
    },
  ];
  res.status(200).json(dummyData);
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("payment_history").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (data && data.length > 0) {
    return res.status(200).json(data);
  }
  const dummyData = [
    {
      transaction_id: "txn_123",
      invoice_id: "inv_123",
      user_id: "usr_123",
      user_email: "john.doe@example.com",
      membership: "Gold",
      payment_gateway: "Stripe",
      payment_type: "Card",
      payer_email: "john.doe@example.com",
      transaction_status: "Completed",
    },
    {
      transaction_id: "txn_456",
      invoice_id: "inv_456",
      user_id: "usr_456",
      user_email: "jane.smith@example.com",
      membership: "Silver",
      payment_gateway: "PayPal",
      payment_type: "PayPal",
      payer_email: "jane.smith@example.com",
      transaction_status: "Completed",
    },
  ];
  res.status(200).json(dummyData);
};

export const getMyPaymentHistory = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { data, error } = await supabase
      .from("payment_history")
      .select("*")
      .eq("user_id", user.id as string);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data || []);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
};

export const createMembershipPlan = async (req: Request, res: Response) => {
  const {
    plan_name,
    plan_type,
    members,
    wp_role,
    price_amount,
    currency,
    duration_months,
  } = req.body;
  const { data, error } = await supabase
    .from("membership_plans")
    .insert([
      {
        plan_name,
        plan_type,
        members: members || 0,
        wp_role,
        price_amount,
        currency,
        duration_months,
      },
    ])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updateMembershipPlan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    plan_name,
    plan_type,
    members,
    wp_role,
    price_amount,
    currency,
    duration_months,
  } = req.body;
  const { data, error } = await supabase
    .from("membership_plans")
    .update({
      plan_name,
      plan_type,
      members,
      wp_role,
      price_amount,
      currency,
      duration_months,
    })
    .eq("plan_id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const deleteMembershipPlan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("membership_plans")
    .delete()
    .eq("plan_id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const createSubscription = async (req: Request, res: Response) => {
  const {
    user_id,
    membership_id,
    start_date,
    expire_next_renewal,
    amount,
    currency,
    payment_type,
    transaction_id,
    status,
  } = req.body;
  const { data, error } = await supabase
    .from("subscriptions")
    .insert([
      {
        user_id,
        membership_id,
        start_date,
        expire_next_renewal,
        amount,
        currency,
        payment_type,
        transaction_id,
        status,
      },
    ])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updateSubscription = async (req: Request, res: Response) => {
  const { id } = req.params; // assume primary key is membership_id or id column
  const {
    user_id,
    membership_id,
    start_date,
    expire_next_renewal,
    amount,
    currency,
    payment_type,
    transaction_id,
    status,
  } = req.body;
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      user_id,
      membership_id,
      start_date,
      expire_next_renewal,
      amount,
      currency,
      payment_type,
      transaction_id,
      status,
    })
    .eq("membership_id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const deleteSubscription = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("membership_id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const createPaymentHistory = async (req: Request, res: Response) => {
  const {
    transaction_id,
    invoice_id,
    user_id,
    plan_id,
    payment_gateway,
    payment_type,
    payer_email,
    transaction_status,
    payment_date,
    amount,
  } = req.body;
  const { data, error } = await supabase
    .from("payment_history")
    .insert([
      {
        transaction_id,
        invoice_id,
        user_id,
        plan_id,
        payment_gateway,
        payment_type,
        payer_email,
        transaction_status,
        payment_date,
        amount,
      },
    ])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const deletePaymentHistory = async (req: Request, res: Response) => {
  const { id } = req.params; // transaction_id as identifier
  const { data, error } = await supabase
    .from("payment_history")
    .delete()
    .eq("transaction_id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};
