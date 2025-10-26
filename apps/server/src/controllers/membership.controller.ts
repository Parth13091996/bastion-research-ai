import { Request, Response } from "express";
import { supabase } from "../supabase";

export const getMembershipPlans = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("membership_plans")
    .select("*")
    .order("plan_id", { ascending: true });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data || []);
};

export const getSubscriptions = async (req: Request, res: Response) => {
  // Enrich subscriptions with user, plan and payment info for UI tables
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      `
      id,
      membership_id,
      start_date,
      expire_next_renewal,
      amount,
      created_at,
      user_id,
      transaction_id,
      users:first_name, users:last_name, users:email,
      users!subscriptions_user_id_fkey ( id, first_name, last_name, email ),
      membership_plans!subscriptions_membership_id_fkey ( plan_id, plan_name, currency, price_amount, plan_code ),
      payment_history!subscriptions_transaction_id_fkey ( transaction_id, transaction_status, payer_email, created_at )
    `
    )
    .order("created_at", { ascending: false });
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const rows = (data as any[]) || [];
  // Map to include commonly used UI fields
  const mapped = rows.map((r: any) => {
    const user = r?.users || {};
    const plan = r?.membership_plans || {};
    const payment = r?.payment_history || {};
    return {
      // original fields
      id: r.id,
      membership_id: r.membership_id,
      start_date: r.start_date,
      expire_next_renewal: r.expire_next_renewal,
      amount: r.amount ?? plan.price_amount ?? null,
      created_at: r.created_at,
      user_id: r.user_id,
      transaction_id: r.transaction_id ?? payment.transaction_id ?? null,
      // enriched fields expected by admin UI
      name: [user.first_name, user.last_name].filter(Boolean).join(" ") || null,
      currency: plan.currency || null,
      payment_type: "Subscription",
      status: payment.transaction_status || "Active",
      user_email: user.email || null,
      membership_name: plan.plan_name || null,
      plan_code: plan.plan_code || null,
    };
  });
  return res.status(200).json(mapped);
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  // Join with users, plans, and subscriptions to provide full rows
  const { data, error } = await supabase
    .from("payment_history")
    .select(
      `
      transaction_id,
      payer_email,
      transaction_status,
      user_id,
      plan_id,
      created_at,
      users!payment_history_user_id_fkey ( id, email, first_name, last_name ),
      membership_plans!payment_history_plan_id_fkey ( plan_id, plan_name, price_amount, currency ),
      subscriptions!subscriptions_transaction_id_fkey ( amount )
    `
    )
    .order("created_at", { ascending: false });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  const rows = (data as any[]) || [];
  const mapped = rows.map((r: any) => {
    const user = r?.users || {};
    const plan = r?.membership_plans || {};
    const sub = r?.subscriptions || {};
    return {
      transaction_id: r.transaction_id,
      invoice_id: r.transaction_id, // using txn id as invoice placeholder
      user_id: r.user_id,
      user_email: user.email || null,
      membership: plan.plan_name || (plan.plan_id != null ? String(plan.plan_id) : null),
      payment_gateway: "Cashfree",
      payment_type: "Subscription",
      payer_email: r.payer_email || user.email || null,
      transaction_status: r.transaction_status || null,
      payment_date: r.created_at,
      amount: sub?.amount ?? plan?.price_amount ?? null,
      currency: plan?.currency || "INR",
      plan_id: r.plan_id,
      created_at: r.created_at,
    };
  });
  return res.status(200).json(mapped);
};

export const getMyPaymentHistory = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { data, error } = await supabase
      .from("payment_history")
      .select(
        `
        transaction_id,
        payer_email,
        transaction_status,
        user_id,
        plan_id,
        created_at,
        membership_plans!payment_history_plan_id_fkey ( plan_name, price_amount, currency ),
        subscriptions!subscriptions_transaction_id_fkey ( amount )
      `
      )
      .eq("user_id", user.id as string)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const rows = (data as any[]) || [];
    const mapped = rows.map((r: any) => {
      const plan = r?.membership_plans || {};
      const sub = r?.subscriptions || {};
      return {
        transaction_id: r.transaction_id,
        invoice_id: r.transaction_id,
        payment_gateway: "Cashfree",
        payment_type: "Subscription",
        payer_email: r.payer_email || null,
        transaction_status: r.transaction_status || null,
        user_id: r.user_id,
        plan_id: r.plan_id,
        payment_date: r.created_at,
        amount: sub?.amount ?? plan?.price_amount ?? null,
        membership: plan?.plan_name || null,
        currency: plan?.currency || "INR",
      };
    });
    return res.status(200).json(mapped);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
};

export const createMembershipPlan = async (req: Request, res: Response) => {
  const {
    plan_name,
    plan_type,
    members,
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
    // currency,
    // payment_type,
    transaction_id,
    // status,
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
        // currency,
        // payment_type,
        transaction_id,
        // status,
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
    // currency,
    // payment_type,
    transaction_id,
    // status,
  } = req.body;
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      user_id,
      membership_id,
      start_date,
      expire_next_renewal,
      amount,
      // currency,
      // payment_type,
      transaction_id,
      // status,
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
    user_id,
    plan_id,
    payer_email,
    transaction_status,
    // payment_date,
    // amount,
  } = req.body;
  const { data, error } = await supabase
    .from("payment_history")
    .insert([
      {
        transaction_id,
        user_id,
        plan_id,
        payer_email,
        transaction_status,
        // payment_date,
        // amount,
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
