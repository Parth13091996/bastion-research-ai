import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/api/axios';

// The server re-reads role, assigned plan and dates; client-side roles never grant access.
export const useSubscription = () => {
  const { isAuthenticated, user } = useAuth();
  return useQuery<SubscriptionData & { can_purchase_core: boolean }>({
    queryKey: [
      queryKeys.subscription,
      user?.id,
      user?.role,
      user?.status,
      user?.subscription_end_date,
    ],
    queryFn: async () => (await axios.get('/api/cashfree/subscription')).data,
    enabled: !!isAuthenticated && !!user?.id,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
};
