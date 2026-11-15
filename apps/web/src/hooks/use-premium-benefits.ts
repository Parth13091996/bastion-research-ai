import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';
export const usePremiumBenefits = (enabled: boolean) => {
  const { user } = useAuth();
  return useQuery<{ coupon_code: string; whatsapp_url: string }>({
    queryKey: ['premium-benefits', user?.id],
    enabled: enabled && !!user?.id,
    queryFn: async () => (await api.get('/api/premium/benefits')).data,
    staleTime: 0,
    retry: 1,
  });
};
