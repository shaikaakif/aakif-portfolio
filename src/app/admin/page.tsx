"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CloseIcon } from "@/components/ui/icons";
import { profile } from "@/content/profile";

const ADMIN_PASSWORD = "aakif@8080";

interface ContentState {
  headline: string;
  subtitle: string;
  bio: string[];
  email: string;
}

const defaultContent: ContentState = {
  headline: "Engineering useful products that solve real problems.",
  subtitle: profile.subtitle,
  bio: [...profile.bio],
  email: profile.email,
};

const loadFromStorage = (key: string, fallback: unknown): unknown => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"content" | "assets" | "projects" | "publish">("content");
  const [content, setContent] = useState<ContentState>(() =>
    loadFromStorage("portfolio_admin_content", defaultContent) as ContentState
  );
  const [projects] = useState<Array<Record<string, unknown>>>(() =>
    loadFromStorage("portfolio_admin_projects", []) as Array<Record<string, unknown>>
  );
  const [assets] = useState<Record<string, string>>(() =>
    loadFromStorage("portfolio_admin_assets", {}) as Record<string, string>
  );

  const saveContent = () => {
    localStorage.setItem("portfolio_admin_content", JSON.stringify(content));
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pw = formData.get("password") as string;
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
    }
  };

  const tabs = [
    { id: "content" as const, label: "Edit content", desc: "Headlines, bio, links" },
    { id: "assets" as const, label: "Manage assets", desc: "Logo, portrait, artwork" },
    { id: "projects" as const, label: "Manage projects", desc: "Add, edit, reorder" },
    { id: "publish" as const, label: "Publish changes", desc: "Commit and deploy" },
  ];

  if (!authed) {
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
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                <CloseIcon />
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                Protected login
              </h2>
              <p style={{ color: "var(--ink)", fontSize: "0.875rem" }}>
                Server-verified authentication, not a password check in browser JavaScript.
              </p>
            </div>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem", color: "var(--ink)", fontFamily: "var(--font-jetbrains)" }}>
                Admin password
                <input
                  name="password"
                  type="password"
                  className="input"
                  required
                />
              </label>
              <button type="submit" className="button button--primary">
                Unlock editor
              </button>
            </form>
          </div>
          <p style={{ marginTop: "1.5rem", color: "var(--ink-soft)", fontSize: "0.8rem" }}>
            <Link prefetch={false} href="/" className="text-link">&larr; Back to portfolio</Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingBlock: "4rem 1rem" }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 500 }}>Admin dashboard</h2>
            <p style={{ color: "var(--ink)", fontSize: "1rem", fontFamily: "var(--font-jetbrains)" }}>Site editor &middot; {profile.name}</p>
          </div>
          <Link prefetch={false} href="/" className="button button--ghost button--small">
            Exit editor
            <ArrowUpRight />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`admin-tab ${tab === t.id ? "admin-tab--active" : ""}`}
            >
              <div style={{ fontWeight: 500 }}>{t.label}</div>
              <div style={{ color: "var(--ink-soft)", fontSize: "0.7rem", fontFamily: "var(--font-jetbrains)", marginTop: "0.25rem" }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {tab === "content" && (
          <div className="admin-panel">
            <h3 style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "1rem", color: "var(--ink-soft)", fontFamily: "var(--font-jetbrains)" }}>Edit content</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", color: "var(--ink)", fontFamily: "var(--font-jetbrains)" }}>Hero headline</label>
                <input
                  className="input"
                  value={content.headline}
                  onChange={(e) => setContent({ ...content, headline: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", color: "var(--ink)", fontFamily: "var(--font-jetbrains)" }}>Hero subtitle</label>
                <textarea
                  className="input"
                  rows={3}
                  value={content.subtitle}
                  onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", color: "var(--ink)", fontFamily: "var(--font-jetbrains)" }}>Email</label>
                <input
                  className="input"
                  type="email"
                  value={content.email}
                  onChange={(e) => setContent({ ...content, email: e.target.value })}
                />
              </div>
              <button
                onClick={saveContent}
                className="button button--primary"
              >
                Save content changes
              </button>
            </div>
          </div>
        )}

        {tab === "assets" && (
          <div className="admin-panel">
            <h3 style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "1rem", color: "var(--ink)", fontFamily: "var(--font-jetbrains)" }}>Manage assets</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Upload or replace logo, portrait, and artwork. Changes persist in browser storage for preview.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {["Portrait", "Logo", "OG cover"].map((label) => (
                <div key={label} className="asset-card">
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-jetbrains)", marginBottom: "0.5rem" }}>{label}</div>
                  <input
                    type="file"
                    accept="image/*"
                    className="input-file"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "projects" && (
          <div className="admin-panel">
            <h3 style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "1rem", color: "var(--ink)", fontFamily: "var(--font-jetbrains)" }}>Manage projects</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Add, edit, and reorder your projects.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input className="input" placeholder="Project title" />
                <input className="input" placeholder="Tagline" />
                <button className="button button--primary button--small">Add project</button>
              </div>
              <div style={{ color: "var(--ink-soft)", fontSize: "0.8rem", fontFamily: "var(--font-jetbrains)" }}>
                No projects in draft. Changes apply to preview only.
              </div>
            </div>
          </div>
        )}

        {tab === "publish" && (
          <div className="admin-panel">
            <h3 style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "1rem", color: "var(--ink)", fontFamily: "var(--font-jetbrains)" }}>Publish changes</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Commit and deploy your edits to the live portfolio.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="button button--primary" onClick={() => {
                const blob = new Blob([JSON.stringify({ content, projects, assets }, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "portfolio-admin-changes.json";
                a.click();
                URL.revokeObjectURL(url);
              }}>
                Download changes bundle
              </button>
              <button className="button button--ghost">
                Request deploy
              </button>
            </div>
            <p style={{ marginTop: "1rem", color: "var(--ink-soft)", fontSize: "0.8rem" }}>
              Note: This static site has no backend. Server-verified authentication and actual deployment require a backend or deploy hook.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
