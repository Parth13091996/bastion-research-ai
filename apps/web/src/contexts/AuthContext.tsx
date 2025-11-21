import { getSession, logoutUser } from "@/api/auth-api";
import { queryKeys } from "@/api/queryKeys";
import { Config } from "@/utils/config";
import { User } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  // Start in loading state to avoid premature redirects on refresh
  const [isLoading, setIsLoading] = useState(true);

  const {
    data,
    isLoading: sessionLoading,
    refetch,
  } = useQuery({
    queryKey: [queryKeys.auth_session],
    queryFn: async () => getSession(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache freshness
    gcTime: 60 * 60 * 1000, // 10 minutes cache retention (TanStack v5: cacheTime -> gcTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  useEffect(() => {
    setUser(data?.user ?? null);
    setIsLoading(sessionLoading);
  }, [data, sessionLoading]);

  const refetchUser = async () => {
    await refetch();
  };

  const refetchUserAfterAgreement = async () => {
    const data = await getSession();
    setUser(data?.user);
    return data?.user;
  };

  const login = (newUser: User) => {
    setUser(newUser);
    // Force a refetch to ensure session is properly established
    refetch();
  };

  const logout = async () => {
    try {
      const response = await logoutUser();
      await refetch();
      toast.success(response?.data?.message || "Logged out successfully");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === Config.roles.admin;

  return (
    <AuthContext.Provider
      value={
        {
          user,
          login,
          logout,
          refetchUser,
          isAuthenticated,
          isAdmin,
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
