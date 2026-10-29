"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import {
  ArrowUpRight,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from "@/components/ui/icons";

export function AdminLogin() {
  const router = useRouter();
  const { signIn, loading: authLoading, user, isAdmin, configured } = useAdminAuth();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      router.replace("/admin/");
    }
  }, [authLoading, user, isAdmin, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!configured || isLoading) return;

    setError(null);
    setIsLoading(true);

    const { error: signInError } = await signIn(password);
    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace("/admin/");
  };

  return (
    <div className="admin-login">
      <div className="admin-login__panel">
        <div className="admin-login__brand">
          <span className="admin-login__mark" aria-hidden="true">
            AS
          </span>
          <div>
            <p className="admin-login__eyebrow">Aakif Studio</p>
            <h1 className="admin-login__title">Welcome back.</h1>
          </div>
        </div>

        <p className="admin-login__intro">
          Enter your studio password to manage projects, gallery images, and
          publishing.
        </p>

        {!configured && (
          <div className="admin-alert admin-alert--error" role="alert">
            Admin sign-in is not configured. Add{" "}
            <code>NEXT_PUBLIC_ADMIN_EMAIL</code> to the deployment environment.
          </div>
        )}

        {error && (
          <div className="admin-alert admin-alert--error" role="alert">
            {error}
          </div>
        )}

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <label className="admin-field" htmlFor="admin-password">
            <span className="admin-field__label">Studio password</span>
            <span className="admin-input-wrap">
              <LockIcon
                width={18}
                height={18}
                className="admin-input-wrap__icon"
              />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="admin-input admin-input--with-icon admin-input--with-action"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                autoFocus
                disabled={isLoading || authLoading || !configured}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="admin-input-wrap__action"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOffIcon width={18} height={18} />
                ) : (
                  <EyeIcon width={18} height={18} />
                )}
              </button>
            </span>
          </label>

          <button
            type="submit"
            className="admin-button admin-button--primary admin-button--block"
            disabled={isLoading || authLoading || !configured || !password}
          >
            {isLoading || authLoading ? "Signing in…" : "Enter studio"}
            {!isLoading && !authLoading && (
              <ArrowUpRight width={16} height={16} />
            )}
          </button>
        </form>

        <div className="admin-login__footer">
          <Link prefetch={false} href="/" className="admin-login__back">
            ← Back to portfolio
          </Link>
          <span className="admin-login__note">
            Protected by Supabase Auth
          </span>
        </div>
      </div>
    </div>
  );
}
