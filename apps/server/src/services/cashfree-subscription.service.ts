import { supabase } from "../supabase";

export const getUserSubscriptionService = async (userId: string) => {
  const [userResult, paymentResult] = await Promise.all([
    supabase
      .from("users")
      .select(
        `
        id,
        plan_id,
        plan_code,
        is_premium,
        status,
        membership_plans!users_plan_id_fkey (
          plan_id,
          plan_name,
          plan_code,
          tier,
          duration_months,
          price_amount
        )
      `
      )
      .eq("id", userId)
      .single(),
    supabase
      .from("payment_history")
      .select(
        `
        transaction_id,
        user_id,
        plan_id,
        transaction_status,
        created_at,
        membership_plans!payment_history_plan_id_fkey (
          plan_id,
          plan_name,
          plan_code,
          tier,
          duration_months,
          price_amount
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (userResult.error) throw new Error(userResult.error.message);

  const user = userResult.data as any;
  const lastPayment = paymentResult?.data as any | null;

  const effectivePlan =
    user?.membership_plans || lastPayment?.membership_plans || null;

  const isPremium =
    Boolean(user?.is_premium) || Boolean(user?.plan_id || user?.plan_code);

  const currentPlan: string | null =
    user?.plan_code ||
    effectivePlan?.plan_code ||
    (effectivePlan?.plan_id != null
      ? String(effectivePlan.plan_id)
      : lastPayment?.plan_id != null
        ? String(lastPayment.plan_id)
        : null);

  let subscription: any = null;
  if (effectivePlan && lastPayment) {
    const startDate = new Date(lastPayment.created_at);
    let expireNextRenewal: string | null = null;
    const durationMonths = effectivePlan.duration_months;
    if (typeof durationMonths === "number" && durationMonths > 0) {
      const exp = new Date(startDate);
      exp.setMonth(exp.getMonth() + durationMonths);
      expireNextRenewal = exp.toISOString();
    }

    subscription = {
      name: effectivePlan.plan_name,
      startDate: startDate.toISOString(),
      expireNextRenewal,
      amount: effectivePlan.price_amount ?? null,
      transactionId: lastPayment.transaction_id,
      plan_code: effectivePlan.plan_code || null,
      tier: effectivePlan.tier ?? null,
    };
  }

  const response = {
    is_premium: isPremium,
    currentPlan,
    subscription,
    lastPayment: lastPayment
      ? {
          amount: effectivePlan?.price_amount ?? null,
          status: lastPayment.transaction_status || "completed",
          email: lastPayment?.payer_email ?? null,
          date: lastPayment.created_at,
          plan_code:
            effectivePlan?.plan_code ||
            (lastPayment.plan_id != null
              ? String(lastPayment.plan_id)
              : null),
        }
      : null,
  };

  return response;
};
