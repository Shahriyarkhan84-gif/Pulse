import { useCallback, useState } from "react";
import { useAppStore } from "@/store";
import * as authApi from "./authApi";

export function useAuth() {
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const session = await authApi.login(email, password);
        setCurrentUser(session.user);
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentUser],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setCurrentUser(null);
  }, [setCurrentUser]);

  return { currentUser, isLoading, login, logout, isAuthenticated: currentUser !== null };
}
