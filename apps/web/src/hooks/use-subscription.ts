import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { useAuth } from "@/contexts/AuthContext";

export const useSubscription = () => {
  const { isAuthenticated, user } = useAuth();

  return useQuery<SubscriptionData | null>({
    queryKey: [
      queryKeys.subscription,
      isAuthenticated,
      user?.id,
      user?.membership_plans?.plan_code,
      user?.is_premium,
    ],
    queryFn: async () => {
      if (!isAuthenticated || !user) return null;

      const currentPlan =
        user.membership_plans?.plan_code ?? null;

      // Treat only non-freemium plans as premium
      const isPremium =
        Boolean(user.is_premium) && currentPlan !== "freemium";

      const data: SubscriptionData = {
        is_premium: isPremium,
        currentPlan,
        subscription: null,
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

