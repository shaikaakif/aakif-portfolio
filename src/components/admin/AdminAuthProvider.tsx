"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  configured: boolean;
  signIn: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

async function verifyAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin_user");
  if (error) {
    throw new Error(
      "Could not verify administrator access. Check the Supabase is_admin_user function and your connection."
    );
  }
  return data === true;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const configured = Boolean(ADMIN_EMAIL);

  const applySession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setUser(session.user);
    try {
      const supabase = createSupabaseBrowserClient();
      const admin = await verifyAdmin(supabase);
      setIsAdmin(admin);
    } catch (error) {
      console.error("Admin verification failed:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const supabase = createSupabaseBrowserClient();

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        await applySession(session);
      } catch (error) {
        console.error("Failed to initialise admin auth:", error);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setLoading(true);
      void applySession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = useCallback(
    async (password: string) => {
      if (!ADMIN_EMAIL) {
        return {
          error: new Error(
            "Admin sign-in is not configured. Add NEXT_PUBLIC_ADMIN_EMAIL to the deployment environment."
          ),
        };
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL.trim(),
          password,
        });

        if (error) {
          return { error: new Error(error.message) };
        }

        if (!data.user) {
          return { error: new Error("Sign-in did not return a session.") };
        }

        const admin = await verifyAdmin(supabase);
        if (!admin) {
          await supabase.auth.signOut();
          setUser(null);
          setIsAdmin(false);
          return {
            error: new Error(
              "This account is not authorized for Aakif Studio."
            ),
          };
        }

        setUser(data.user);
        setIsAdmin(true);
        setLoading(false);
        return { error: null };
      } catch (error) {
        return {
          error:
            error instanceof Error ? error : new Error("Unable to sign in."),
        };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // Clear local state regardless of network errors.
    }
    setUser(null);
    setIsAdmin(false);
  }, []);

  const refreshAdminStatus = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    try {
      const admin = await verifyAdmin(supabase);
      setIsAdmin(admin);
      return admin;
    } catch {
      setIsAdmin(false);
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      configured,
      signIn,
      signOut,
      refreshAdminStatus,
    }),
    [user, isAdmin, loading, configured, signIn, signOut, refreshAdminStatus]
  );

  return (
    <AdminAuthContext.Provider value={value}>
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
