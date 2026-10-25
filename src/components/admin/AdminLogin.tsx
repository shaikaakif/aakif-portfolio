"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { ArrowUpRight, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/components/ui/icons";

export function AdminLogin() {
  const router = useRouter();
  const { signIn, loading: authLoading, defaultEmail } = useAdminAuth();

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/admin/");
  };

  return (
    <section className="section" style={{ paddingBlock: "6rem 2rem" }}>
      <div className="container" style={{ maxWidth: "34rem" }}>
        <div
          className="card"
          style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-xl)",
            padding: "2.5rem",
            background: "var(--paper-soft)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 500, marginBottom: "0.5rem" }}>
              Aakif Studio
            </h2>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.875rem" }}>
              Sign in to manage your portfolio
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "color-mix(in oklab, var(--accent) 15%, transparent)",
                border: "1px solid var(--accent)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                color: "var(--accent-deep)",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem", color: "var(--ink)", fontFamily: "var(--font-jetbrains)" }}>
              Email
              <div style={{ position: "relative" }}>
                <MailIcon width={18} height={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input
                  name="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading || authLoading}
                  style={{ paddingLeft: "2.5rem", width: "100%" }}
                />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem", color: "var(--ink)", fontFamily: "var(--font-jetbrains)" }}>
              Password
              <div style={{ position: "relative" }}>
                <LockIcon width={18} height={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLoading || authLoading}
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem", width: "100%" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    padding: "0.25rem",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="button button--primary"
              disabled={isLoading || authLoading}
              style={{ marginTop: "0.5rem" }}
            >
              {isLoading || authLoading ? "Signing in…" : "Sign in to Studio"}
              <ArrowUpRight width={15} height={15} />
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", color: "var(--ink-soft)", fontSize: "0.8rem", textAlign: "center" }}>
            <Link prefetch={false} href="/" className="text-link" style={{ justifyContent: "center" }}>
              ← Back to portfolio
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}