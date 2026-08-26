import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { useAppStore } from "@/store";
import * as authApi from "./authApi";

export function useAuth() {
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async (userId: string | undefined) => {
      if (!userId) {
        setCurrentUser(null);
        return;
      }
      setCurrentUser(await authApi.fetchProfile(userId));
    };

    supabase.auth.getSession().then(({ data }) => {
      loadProfile(data.session?.user.id).finally(() => setIsLoading(false));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user.id);
    });

    return () => subscription.subscription.unsubscribe();
  }, [setCurrentUser]);

  const login = useCallback(async (email: string, password: string) => {
    await authApi.login(email, password);
  }, []);

  const signup = useCallback(async (email: string, password: string, username: string) => {
    await authApi.signup(email, password, username);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!currentUser) return;
    setCurrentUser(await authApi.fetchProfile(currentUser.id));
  }, [currentUser, setCurrentUser]);

  return {
    currentUser,
    isLoading,
    login,
    signup,
    logout,
    refreshProfile,
    isAuthenticated: currentUser !== null,
  };
}
