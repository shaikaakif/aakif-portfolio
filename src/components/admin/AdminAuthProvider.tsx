"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "aakifshaik512@gmail.com";
const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "aakif@8080";

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setIsAdmin(Boolean(session?.user));
          setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event: string, session: Session | null) => {
            if (!mounted) return;
            setUser(session?.user ?? null);
            setIsAdmin(Boolean(session?.user));
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

  const signIn = async (password: string) => {
    if (password !== ADMIN_PASSWORD) {
      return { error: new Error("Incorrect password.") };
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });

      if (error) {
        return {
          error: new Error(
            `${error.message}. Make sure ${ADMIN_EMAIL} exists in Supabase Auth with this password.`
          ),
        };
      }

      setUser(data.user ?? null);
      setIsAdmin(Boolean(data.user));
      setLoading(false);

      return { error: null };
    } catch (err: unknown) {
      return {
        error: err instanceof Error ? err : new Error("Unable to sign in."),
      };
    }
  };

  const signOut = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore sign-out errors; clear local state regardless.
    }
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