import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { useAuth } from "@/contexts/AuthContext";

const isSubscriptionExpired = (subscriptionEndDate?: string | null) => {
  if (!subscriptionEndDate) return false;
  const endDate = new Date(subscriptionEndDate);
  if (isNaN(endDate.getTime())) return false;

  const today = new Date();

  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // Expired if end date is today or in the past
  return end <= todayDate;
};

export const useSubscription = () => {
  const { isAuthenticated, user } = useAuth();

  const membershipPlan = Array.isArray(user?.membership_plans)
    ? user?.membership_plans[0]
    : user?.membership_plans;

  return useQuery<SubscriptionData | null>({
    queryKey: [
      queryKeys.subscription,
      isAuthenticated,
      user?.id,
      user?.role,
      user?.status,
      membershipPlan?.plan_code,
      user?.subscription_start_date ?? null,
      user?.subscription_end_date ?? null,
    ],
    queryFn: async () => {
      if (!isAuthenticated || !user) return null;

      const isRoleSubscriber =
        user.role === "core_subscriber" ||
        user.role === "research_ally_subscriber" ||
        user.role === "ipo_subscriber";

      const fallbackPlanCode =
        user.role === "research_ally_subscriber"
          ? "research_hub"
          : user.role === "ipo_subscriber"
            ? "ipo"
            : "core";

      const rawPlanCode =
        membershipPlan?.plan_code ?? (isRoleSubscriber ? fallbackPlanCode : "freemium");

      const expired = isSubscriptionExpired(user.subscription_end_date);

      // A user is premium if:
      // 1. Their attached plan is not freemium and not expired, OR
      // 2. Their role is an active subscriber and not expired.
      const isPremiumPlan =
        (rawPlanCode !== "freemium" && !expired) ||
        (isRoleSubscriber && user.status === "active" && !expired);

      const currentPlan = isPremiumPlan ? rawPlanCode : "freemium";

      const hasSubscriptionWindow =
        !!user.subscription_start_date ||
        !!user.subscription_end_date ||
        isRoleSubscriber;

      const subscriptionDetails: SubscriptionData["subscription"] =
        hasSubscriptionWindow
          ? {
            name:
              membershipPlan?.plan_name ||
              (rawPlanCode && rawPlanCode !== "freemium"
                ? rawPlanCode.replace("_", " ").toUpperCase()
                : isRoleSubscriber
                  ? "CORE"
                  : "FREEMIUM"),
            startDate:
              user.subscription_start_date ??
              user.created_at ??
              new Date().toISOString(),
            expireNextRenewal: user.subscription_end_date ?? null,
            amount: membershipPlan?.price_amount ?? 0,
            transactionId: "",
            plan_code: rawPlanCode,
            tier: null,
          }
          : null;

      const data: SubscriptionData = {
        is_premium: isPremiumPlan,
        currentPlan,
        subscription: subscriptionDetails,
        lastPayment: null,
      };

      return data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });
};
