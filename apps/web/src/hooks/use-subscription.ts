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

  return useQuery<SubscriptionData | null>({
    queryKey: [
      queryKeys.subscription,
      isAuthenticated,
      user?.id,
      user?.membership_plans?.plan_code,
      user?.subscription_start_date ?? null,
      user?.subscription_end_date ?? null,
    ],
    queryFn: async () => {
      if (!isAuthenticated || !user) return null;

      const rawPlanCode = user.membership_plans?.plan_code ?? "freemium";
      const expired = isSubscriptionExpired(user.subscription_end_date);
      const isPremiumPlan = rawPlanCode !== "freemium" && !expired;
      const currentPlan = isPremiumPlan ? rawPlanCode : "freemium";

      const hasSubscriptionWindow =
        !!user.subscription_start_date || !!user.subscription_end_date;

      const subscriptionDetails: SubscriptionData["subscription"] =
        hasSubscriptionWindow
          ? {
              name:
                rawPlanCode && rawPlanCode !== "freemium"
                  ? rawPlanCode.toUpperCase()
                  : "FREEMIUM",
              startDate:
                user.subscription_start_date ?? user.created_at ?? new Date().toISOString(),
              expireNextRenewal: user.subscription_end_date ?? null,
              amount: 0,
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
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });
};
