import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axios";
import { endpoints } from "@/api/endpoints";
import { queryKeys } from "@/api/queryKeys";
import { useAuth } from "@/contexts/AuthContext";

export const useSubscription = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: [queryKeys.subscription],
    queryFn: async () =>
      (await axiosInstance.get(endpoints.cashfree.subscription)).data,
    enabled: isAuthenticated,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
};

