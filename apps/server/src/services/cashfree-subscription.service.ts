import { supabase } from "../supabase";

export const getUserSubscriptionService = async (userId: string) => {
  const [userResult, subscriptionResult] = await Promise.all([
    supabase.from("users").select(" plan_code").eq("id", userId).single(),
    supabase
      .from("subscriptions")
      .select(
        `
          start_date,
          expire_next_renewal,
          amount,
          transaction_id,
          membership_id,
          created_at,
          membership_plans(plan_code, tier, plan_name)
        `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (userResult.error) throw new Error(userResult.error.message);

  const user = userResult.data;
  const subscription = !subscriptionResult?.data
    ? null
    : ({
        ...subscriptionResult.data,
        plan_code:
          // @ts-ignore
          subscriptionResult?.data?.membership_plans?.plan_code || null,
        plan_name:
          // @ts-ignore
          subscriptionResult?.data?.membership_plans?.plan_name || null,
        // @ts-ignore
        tier: subscriptionResult?.data?.membership_plans?.tier || null,
      } as any);

  const currentPlan: string | null =
    subscription?.plan_code || user?.plan_code || null;

  const response = {
    is_premium: Boolean(user?.plan_code),
    currentPlan,
    subscription: subscription
      ? {
          name: subscription.plan_name,
          startDate: subscription.start_date,
          expireNextRenewal: subscription.expire_next_renewal,
          amount: subscription.amount,
          transactionId: subscription.transaction_id,
          plan_code: subscription.plan_code,
          tier: subscription.tier,
        }
      : null,
    lastPayment: subscription
      ? {
          amount: subscription.amount,
          status: "completed",
          email: null,
          date: subscription.created_at,
          plan_code: subscription.plan_code,
        }
      : null,
  };

  return response;
};
