"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import {
  ArrowUpRight,
  HomeIcon,
  FolderIcon,
  ImageIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
} from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon },
  { href: "/admin/projects", label: "Projects", icon: FolderIcon },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/media", label: "Media Library", icon: GridIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
] as const;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isAdmin, loading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const isLoginRoute = normalizedPath === "/admin/login";

  useEffect(() => {
    if (!loading && !user && !isLoginRoute) {
      router.replace("/admin/login/");
    }
  }, [loading, user, isLoginRoute, router]);

  if (isLoginRoute) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="admin-gate">
        <p>{loading ? "Checking access…" : "Redirecting to sign in…"}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-gate">
        <div className="admin-gate-card">
          <h1>Access restricted</h1>
          <p>
            {user.email} is signed in but is not registered as an administrator
            for Aakif Studio. Ask the site owner to add this account.
          </p>
          <div className="admin-gate-actions">
            <button
              type="button"
              className="button button--primary"
              onClick={() => signOut()}
            >
              Sign out
            </button>
            <Link href="/" className="button button--ghost">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="admin-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"} ${mobileMenuOpen ? "mobile-open" : ""}`}
        role="navigation"
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar-header">
          <Link href="/admin" className="admin-brand" aria-label="Aakif Studio Home">
            <span className="admin-brand-icon" aria-hidden="true">
              <HomeIcon width={24} height={24} />
            </span>
            <span className={sidebarOpen ? "admin-brand-text" : "admin-brand-text-hidden"}>
              Aakif Studio
            </span>
          </Link>
          <button
            className="admin-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <ChevronLeftIcon width={20} height={20} /> : <ChevronRightIcon width={20} height={20} />}
          </button>
        </div>

        <nav className="admin-nav" aria-label="Main navigation">
          <ul role="list">
            {NAV_ITEMS.map((item) => {
              const isActive = normalizedPath === item.href || normalizedPath.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`admin-nav-link ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="admin-nav-icon" aria-hidden="true">
                      <Icon width={20} height={20} />
                    </span>
                    <span className={sidebarOpen ? "admin-nav-text" : "admin-nav-text-hidden"}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="admin-signout"
            onClick={async () => { await signOut(); setMobileMenuOpen(false); }}
            disabled={!user}
          >
            <span className="admin-signout-icon" aria-hidden="true">
              <LogOutIcon width={20} height={20} />
            </span>
            <span className={sidebarOpen ? "admin-signout-text" : "admin-signout-text-hidden"}>
              Sign Out
            </span>
          </button>
          {user && sidebarOpen && (
            <p className="admin-user-email" style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.5rem", padding: "0 1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </p>
          )}
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        className="admin-mobile-menu-btn"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        <GridIcon width={24} height={24} />
      </button>

      {/* Main content */}
      <main className="admin-main" role="main">
        <header className="admin-header">
          <div className="admin-header-left">
            <h1 className="admin-page-title">
              {NAV_ITEMS.find((i) => normalizedPath === i.href || normalizedPath.startsWith(i.href + "/"))?.label || "Dashboard"}
            </h1>
          </div>
          <div className="admin-header-right">
            <Link href="/" className="admin-view-site" target="_blank" rel="noopener noreferrer">
              <ArrowUpRight width={16} height={16} />
              <span>View Site</span>
            </Link>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>

      <style jsx>{`
        .admin-layout {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          min-height: 100vh;
          background: var(--paper);
        }

        .admin-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(22, 20, 15, 0.5);
          z-index: 99;
        }

        .admin-sidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          border-right: 1px solid var(--line);
          background: var(--paper-soft);
          display: flex;
          flex-direction: column;
          transition: width 250ms ease;
          z-index: 100;
          width: var(--admin-sidebar-width);
          --admin-sidebar-width: 16rem;
        }

        .admin-sidebar.collapsed {
          --admin-sidebar-width: 4.5rem;
        }

        .admin-sidebar.mobile-open {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 16rem !important;
          box-shadow: var(--shadow-lift);
          transform: translateX(0);
        }

        @media (max-width: 64rem) {
          .admin-layout {
            grid-template-columns: 1fr;
          }
          .admin-sidebar {
            position: fixed;
            transform: translateX(-100%);
          }
          .admin-sidebar.mobile-open {
            transform: translateX(0);
          }
          .admin-overlay {
            display: block;
          }
          .admin-mobile-menu-btn {
            display: grid;
            place-items: center;
            width: 2.75rem;
            height: 2.75rem;
            border: 1px solid var(--line-strong);
            border-radius: 50%;
            background: transparent;
            color: var(--ink);
            cursor: pointer;
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 101;
          }
        }

        .admin-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 4.75rem;
          padding: 0 1rem;
          border-bottom: 1px solid var(--line);
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--ink);
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
        }

        .admin-brand-icon {
          display: grid;
          place-items: center;
          width: 2.25rem;
          height: 2.25rem;
          border: 1px solid var(--ink);
          border-radius: 50%;
          color: var(--ink);
          flex-shrink: 0;
        }

        .admin-brand-text-hidden {
          display: none;
        }

        .admin-sidebar-toggle {
          display: grid;
          place-items: center;
          width: 2.25rem;
          height: 2.25rem;
          border: 1px solid var(--line-strong);
          border-radius: 50%;
          background: transparent;
          color: var(--ink);
          cursor: pointer;
          flex-shrink: 0;
        }

        .admin-nav {
          flex: 1;
          padding: 1rem 0.5rem;
          overflow-y: auto;
        }

        .admin-nav ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--ink-soft);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: background-color 150ms ease, color 150ms ease;
        }

        .admin-nav-link:hover {
          background: color-mix(in oklab, var(--ink) 8%, transparent);
          color: var(--ink);
        }

        .admin-nav-link.active {
          background: var(--accent-soft);
          color: var(--accent);
        }

        .admin-nav-icon {
          display: grid;
          place-items: center;
          width: 2rem;
          height: 2rem;
          flex-shrink: 0;
        }

        .admin-nav-text-hidden {
          display: none;
        }

        .admin-sidebar-footer {
          padding: 1rem 0.5rem;
          border-top: 1px solid var(--line);
        }

        .admin-signout {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--line-strong);
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--ink-soft);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .admin-signout:hover:not(:disabled) {
          border-color: var(--ink);
          background: var(--ink);
          color: var(--paper-soft);
        }

        .admin-signout:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .admin-signout-text-hidden {
          display: none;
        }

        .admin-main {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1.5rem clamp(1.25rem, 4.2vw, 4.5rem);
          border-bottom: 1px solid var(--line);
          background: var(--paper);
          flex-wrap: wrap;
        }

        .admin-page-title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        .admin-view-site {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          border: 1px solid var(--line-strong);
          border-radius: 999px;
          background: transparent;
          color: var(--ink-soft);
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 150ms ease;
        }

        .admin-view-site:hover {
          border-color: var(--ink);
          color: var(--ink);
        }

        .admin-content {
          flex: 1;
          padding: clamp(1.5rem, 3vw, 2.5rem) clamp(1.25rem, 4.2vw, 4.5rem);
        }
      `}</style>
    </div>
  );
}