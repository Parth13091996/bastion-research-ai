import { getSession, logoutUser } from "@/api/auth-api";
import { queryKeys } from "@/api/queryKeys";
import { Config } from "@/utils/config";
import { User } from "@repo/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
// import { useSubscriptionWhatsappReminder } from "@/hooks/use-subscription-whatsapp-reminder";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | undefined>(undefined);
  // Start in loading state to avoid premature redirects on refresh
  const [isLoading, setIsLoading] = useState(true);

  const {
    data,
    isLoading: sessionLoading,
    refetch,
  } = useQuery({
    queryKey: [queryKeys.auth_session],
    queryFn: async () => {
      try {
        return await getSession();
      } catch {
        return { user: null };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache freshness
    gcTime: 60 * 60 * 1000, // 10 minutes cache retention (TanStack v5: cacheTime -> gcTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  useEffect(() => {
    setUser(data?.user ?? null);
    setIsLoading(sessionLoading);
  }, [data, sessionLoading]);

  // Subscription reminders are automated on the backend scheduler; disabled client-side triggering
  // useSubscriptionWhatsappReminder(data?.user ?? null);

  const refetchUser = async () => {
    await refetch();
  };

  const refetchUserAfterAgreement = async () => {
    const data = await getSession();
    setUser(data?.user);
    return data?.user;
  };

  const login = (newUser: User, token?: string, refreshToken?: string) => {
    if (typeof window !== "undefined") {
      try {
        if (token && token !== "undefined" && token !== "null") {
          localStorage.setItem("token", token);
        }
        if (refreshToken && refreshToken !== "undefined" && refreshToken !== "null") {
          localStorage.setItem("refreshToken", refreshToken);
        }
      } catch {}
    }
    setUser(newUser);
    queryClient.setQueryData([queryKeys.auth_session], { user: newUser });
    queryClient.invalidateQueries({ queryKey: [queryKeys.subscription] });
    // Force a refetch to ensure session is properly established
    refetch();
  };

  const logout = async () => {
    try {
      const response = await logoutUser();
      queryClient.setQueryData([queryKeys.auth_session], null);
      queryClient.invalidateQueries({ queryKey: [queryKeys.subscription] });
      await refetch();
      toast.success(response?.data?.message || "Logged out successfully");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("onboarding_open");
        } catch {}
      }
      queryClient.setQueryData([queryKeys.auth_session], null);
      queryClient.invalidateQueries({ queryKey: [queryKeys.subscription] });
      setUser(null);
    }
  };

  const isAuthenticated =
    Boolean(user) &&
    (user?.status === "active" ||
      (user?.status === "free" && user?.role === "free_subscriber") ||
      user?.status === "agreement_signed" ||
      user?.role === Config.roles.admin ||
      user?.role === Config.roles.employee);
  const isOnboarding =
    Boolean(user) &&
    user?.role !== Config.roles.admin &&
    user?.role !== Config.roles.employee &&
    (user?.status === "pending" || user?.status === "onboarded");
  const isAdmin = user?.role === Config.roles.admin;
  const isEmployee = user?.role === Config.roles.employee;
  const isStaff = isAdmin || isEmployee;

  return (
    <AuthContext.Provider
      value={
        {
          user,
          login,
          logout,
          refetchUser,
          isAuthenticated,
          isOnboarding,
          isAdmin,
          isEmployee,
          isStaff,
          isLoading,
          refetchUserAfterAgreement,
        } as any
      }
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
