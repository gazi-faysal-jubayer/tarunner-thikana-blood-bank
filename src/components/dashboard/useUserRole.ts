"use client";

import { useState, useEffect } from "react";

export type UserRole = "admin" | "volunteer" | "donor";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  bloodGroup?: string;
}

interface UseUserRoleReturn {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserRole(): UseUserRoleReturn {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      
      if (!data.authenticated) {
        setUser(null);
        setError("Not authenticated");
        return;
      }
      
      setUser({
        id: data.user.id,
        name: data.user.name || "",
        email: data.user.email,
        role: data.role as UserRole,
        avatar: null,
        bloodGroup: undefined,
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}



