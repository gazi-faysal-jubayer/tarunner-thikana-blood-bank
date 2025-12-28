"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null; // 'admin' | 'volunteer' | 'donor'
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const supabase = createClient();

  // Helper to fetch role
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
        
      if (error) {
        console.error("Error fetching role:", error);
        return null;
      }
      return data?.role as UserRole;
    } catch (err) {
      console.error("Unexpected error fetching role:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          if (session) {
            setSession(session);
            setUser(session.user);
            const userRole = await fetchUserRole(session.user.id);
            if (mounted) setRole(userRole || "donor"); // Default to donor if role not found
          } else {
            setSession(null);
            setUser(null);
            setRole(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (mounted) setLoading(false);
      }
    }

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      if (session) {
        setSession(session);
        setUser(session.user);
        // Only fetch role if user changed or role is missing
        if (session.user.id !== user?.id || !role) {
            const userRole = await fetchUserRole(session.user.id);
            if (mounted) setRole(userRole || "donor");
        }
      } else {
        setSession(null);
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && data.user) {
        // Optimistically fetch role or let the effect handle it
        // Letting effect handle it ensures consistency, but we can do it here to return role-aware success
        const userRole = await fetchUserRole(data.user.id);
        setRole(userRole || "donor");
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    router.push("/login");
  };

  const refreshRole = async () => {
    if (user) {
      const userRole = await fetchUserRole(user.id);
      setRole(userRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        signIn,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
