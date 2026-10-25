"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("admin_users")
        .select("is_active")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setIsAdmin(false);
      } else {
        setIsAdmin(Boolean(data.is_active));
      }
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          await checkAdmin(session?.user?.id);
          setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event: string, session: Session | null) => {
            if (!mounted) return;
            setUser(session?.user ?? null);
            if (session?.user) {
              await checkAdmin(session.user.id);
            } else {
              setIsAdmin(false);
            }
            setLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      } catch (err: unknown) {
        console.error("Failed to initialise admin auth:", err);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}