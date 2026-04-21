import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import type { User, InsertUser, SignupInput, LoginInput } from "@shared/schema";

type AuthUser = User & { isAdmin?: boolean };

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (options?: { onSuccess?: () => void }) => void;
  closeAuthModal: () => void;
  authModalOnSuccess: (() => void) | null;
  signup: (data: SignupInput) => Promise<{ user: User; isNewUser: boolean }>;
  login: (data: LoginInput) => Promise<{ user: User; isNewUser: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<InsertUser>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalOnSuccess, setAuthModalOnSuccess] = useState<(() => void) | null>(null);

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const openAuthModal = useCallback((options?: { onSuccess?: () => void }) => {
    setAuthModalOnSuccess(() => options?.onSuccess ?? null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalOnSuccess(null);
  }, []);

  const signup = useCallback(async (data: SignupInput) => {
    const res = await apiRequest("POST", "/api/auth/signup", data);
    const result = await res.json();
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    return result;
  }, []);

  const login = useCallback(async (data: LoginInput) => {
    const res = await apiRequest("POST", "/api/auth/login", data);
    const result = await res.json();
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    return result;
  }, []);

  const logout = useCallback(async () => {
    await apiRequest("POST", "/api/auth/logout");
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  }, []);

  const updateProfile = useCallback(async (data: Partial<InsertUser>) => {
    const res = await apiRequest("POST", "/api/auth/update", data);
    const updated = await res.json();
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    return updated;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalOnSuccess,
        signup,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
