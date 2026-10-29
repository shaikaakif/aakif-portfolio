"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  FolderIcon,
  GridIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
} from "@/components/ui/icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon, exact: true },
  { href: "/admin/projects", label: "Projects", icon: FolderIcon },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/media", label: "Media Library", icon: GridIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
] as const;

interface AdminLayoutProps {
  children: React.ReactNode;
}

function isActivePath(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isAdmin, loading } = useAdminAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const isLoginRoute = normalizedPath === "/admin/login";
  const currentItem = NAV_ITEMS.find((item) =>
    isActivePath(normalizedPath, item.href, "exact" in item ? item.exact : false)
  );

  useEffect(() => {
    if (!loading && (!user || !isAdmin) && !isLoginRoute) {
      router.replace("/admin/login/");
    }
  }, [loading, user, isAdmin, isLoginRoute, router]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  if (isLoginRoute) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="admin-gate" role="status" aria-live="polite">
        <span className="admin-spinner" aria-hidden="true" />
        <p>{loading ? "Checking studio access…" : "Redirecting to sign in…"}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-gate">
        <div className="admin-gate-card">
          <p className="admin-eyebrow">Aakif Studio</p>
          <h1>Access restricted</h1>
          <p>
            {user.email} is signed in but is not registered as an administrator
            for Aakif Studio.
          </p>
          <div className="admin-gate-actions">
            <button
              type="button"
              className="admin-button admin-button--primary"
              onClick={() => {
                void signOut().then(() => router.replace("/admin/login/"));
              }}
            >
              Sign out
            </button>
            <Link href="/" className="admin-button admin-button--ghost">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = (user.email ?? "AS").slice(0, 2).toUpperCase();

  return (
    <div
      className="admin-shell"
      data-sidebar-collapsed={sidebarCollapsed ? "true" : "false"}
    >
      <a href="#admin-content" className="admin-skip-link">
        Skip to admin content
      </a>

      {mobileMenuOpen && (
        <button
          type="button"
          className="admin-overlay"
          aria-label="Close navigation"
          onClick={() => {
            setMobileMenuOpen(false);
            menuButtonRef.current?.focus();
          }}
        />
      )}

      <aside
        id="admin-sidebar"
        className={`admin-sidebar${mobileMenuOpen ? " is-mobile-open" : ""}`}
        aria-label="Studio navigation"
      >
        <div className="admin-sidebar__head">
          <Link
            href="/admin"
            className="admin-brand"
            aria-label="Aakif Studio dashboard"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="admin-brand__mark" aria-hidden="true">
              AS
            </span>
            <span className="admin-brand__text">
              <span className="admin-brand__name">Aakif Studio</span>
              <span className="admin-brand__meta">Content workspace</span>
            </span>
          </Link>

          <button
            type="button"
            className="admin-sidebar__collapse"
            onClick={() => setSidebarCollapsed((current) => !current)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon width={18} height={18} />
            ) : (
              <ChevronLeftIcon width={18} height={18} />
            )}
          </button>
        </div>

        <nav className="admin-nav" aria-label="Studio sections">
          <p className="admin-nav__label">Workspace</p>
          <ul>
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(
                normalizedPath,
                item.href,
                "exact" in item ? item.exact : false
              );
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`admin-nav__link${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    title={sidebarCollapsed ? item.label : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="admin-nav__icon" aria-hidden="true">
                      <Icon width={20} height={20} />
                    </span>
                    <span className="admin-nav__text">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-sidebar__foot">
          <div className="admin-account">
            <span className="admin-account__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="admin-account__details">
              <span className="admin-account__label">Signed in</span>
              <span className="admin-account__email" title={user.email ?? ""}>
                {user.email}
              </span>
            </span>
          </div>
          <button
            type="button"
            className="admin-signout"
            onClick={() => {
              void signOut().then(() => router.replace("/admin/login/"));
            }}
          >
            <LogOutIcon width={18} height={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            ref={menuButtonRef}
            type="button"
            className="admin-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open studio navigation"
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-sidebar"
          >
            <MenuIcon width={20} height={20} />
          </button>

          <nav className="admin-breadcrumb" aria-label="Breadcrumb">
            <Link href="/admin">Studio</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{currentItem?.label ?? "Dashboard"}</span>
          </nav>

          <div className="admin-topbar__actions">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-button admin-button--ghost admin-button--small"
            >
              <span>View site</span>
              <ExternalLinkIcon width={15} height={15} />
            </Link>
          </div>
        </header>

        <main id="admin-content" className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
