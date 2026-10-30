import { accessForUser, coreIntroConsumed } from './premium-access.service';
import { supabase } from "../supabase";

export const getUserSubscriptionService = async (userId: string) => {
  const [userResult, paymentResult] = await Promise.all([
    supabase
      .from("users")
      .select(
        `
        id,
        role,
        plan_id,
        status,
        subscription_start_date,
        subscription_end_date,
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

  const { premium: isPremium, plan: effectivePlan } = await accessForUser(user);
  const currentPlan = isPremium ? (effectivePlan?.plan_code === 'core' ? 'core' : 'core_annual') : 'freemium';
  const canPurchaseCore = !(await coreIntroConsumed(userId));

  let subscription: any = null;
  if (effectivePlan && (user?.subscription_start_date || lastPayment)) {
    // Dates are never inferred from payment attempts or missing data.
    const startDate = user.subscription_start_date && Number.isFinite(Date.parse(user.subscription_start_date)) ? new Date(user.subscription_start_date) : null;
    const expireNextRenewal = user.subscription_end_date && Number.isFinite(Date.parse(user.subscription_end_date)) ? user.subscription_end_date : null;

    if (startDate) {
      subscription = {
        name: effectivePlan.plan_name,
        startDate: startDate.toISOString(),
        expireNextRenewal,
        amount: effectivePlan.price_amount ?? null,
        transactionId: lastPayment?.transaction_id ?? null,
        plan_code: effectivePlan.plan_code || null,
        tier: effectivePlan.tier ?? null,
      };
    }
  }

  const response = {
    is_premium: isPremium,
    can_purchase_core: canPurchaseCore,
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
            (lastPayment.plan_id != null ? String(lastPayment.plan_id) : null),
        }
      : null,
  };

  return response;
};
