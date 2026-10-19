import { supabase } from "../supabase";

export const getUserSubscriptionService = async (userId: string) => {
  const [userResult, lastAttemptResult, lastSuccessResult] = await Promise.all([
    supabase
      .from("users")
      .select(
        `
        id,
        plan_id,
        status,
        role,
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
        payer_email,
        discounted_amount,
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
    supabase
      .from("payment_history")
      .select(
        `
        transaction_id,
        user_id,
        plan_id,
        transaction_status,
        created_at,
        payer_email,
        discounted_amount,
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
      .in("transaction_status", ["SUCCESS", "FREE", "COUPON_APPLIED"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (userResult.error) throw new Error(userResult.error.message);

  const user = userResult.data as any;
  const lastAttemptPayment = lastAttemptResult?.data as any | null;
  const lastSuccessPayment = lastSuccessResult?.data as any | null;

  // The active paid plan comes from a verified successful payment or the user's active plan record
  const effectivePlan =
    (lastSuccessPayment && lastSuccessPayment.membership_plans) ||
    user?.membership_plans ||
    null;

  const isPaidPlan = Boolean(
    effectivePlan &&
      effectivePlan.plan_code !== "freemium" &&
      (effectivePlan.price_amount > 0 || (effectivePlan.tier && effectivePlan.tier > 0))
  );

  // Check whether subscription dates are valid and not expired
  const hasValidDates = Boolean(
    user?.subscription_end_date
      ? new Date(user.subscription_end_date) >= new Date()
      : user?.subscription_start_date && !user?.subscription_end_date
  );

  // Authoritative entitlement check:
  // A user is premium ONLY IF:
  // 1. User status is 'active' (never 'onboarded' or 'payment_pending')
  // 2. The plan is a paid plan (not 'freemium')
  // 3. User has a verified successful payment OR valid active subscription dates
  const isPremium = Boolean(
    user?.status === "active" &&
      isPaidPlan &&
      (lastSuccessPayment != null || hasValidDates)
  );

  const currentPlan: string = isPremium && effectivePlan?.plan_code
    ? effectivePlan.plan_code
    : "freemium";

  let subscription: any = null;
  if (isPremium && effectivePlan) {
    let startDate: Date | null = null;
    let expireNextRenewal: string | null = null;

    if (user?.subscription_start_date) {
      startDate = new Date(user.subscription_start_date);
      if (user.subscription_end_date) {
        expireNextRenewal = new Date(user.subscription_end_date).toISOString();
      } else {
        const durationMonths = effectivePlan.duration_months;
        if (typeof durationMonths === "number" && durationMonths > 0) {
          const exp = new Date(startDate);
          exp.setMonth(exp.getMonth() + durationMonths);
          expireNextRenewal = exp.toISOString();
        }
      }
    } else if (lastSuccessPayment?.created_at) {
      startDate = new Date(lastSuccessPayment.created_at);
      const durationMonths = effectivePlan.duration_months;
      if (typeof durationMonths === "number" && durationMonths > 0) {
        const exp = new Date(startDate);
        exp.setMonth(exp.getMonth() + durationMonths);
        expireNextRenewal = exp.toISOString();
      }
    }

    if (startDate) {
      subscription = {
        name: effectivePlan.plan_name,
        startDate: startDate.toISOString(),
        expireNextRenewal,
        amount: effectivePlan.price_amount ?? null,
        transactionId: lastSuccessPayment?.transaction_id ?? null,
        plan_code: effectivePlan.plan_code || null,
        tier: effectivePlan.tier ?? null,
      };
    }
  }

  // Display the latest attempt (e.g. USER_DROPPED, FAILED, PENDING, or SUCCESS) so UI can reflect real state
  const displayPayment = lastAttemptPayment || lastSuccessPayment;

  const response = {
    is_premium: isPremium,
    currentPlan,
    subscription,
    lastPayment: displayPayment
      ? {
          amount:
            displayPayment.discounted_amount ??
            displayPayment.membership_plans?.price_amount ??
            null,
          status: displayPayment.transaction_status || "PENDING",
          email: displayPayment.payer_email ?? null,
          date: displayPayment.created_at,
          plan_code:
            displayPayment.membership_plans?.plan_code ||
            (displayPayment.plan_id != null ? String(displayPayment.plan_id) : null),
        }
      : null,
  };

  return response;
};
