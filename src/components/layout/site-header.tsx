"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ArrowUpRight, GearIcon } from "@/components/ui/icons";

const navItems = [
  { href: "/work/", label: "Work" },
  { href: "/about/", label: "About" },
  { href: "/#contact", label: "Contact" },
];

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/work/", label: "Work" },
  { href: "/about/", label: "About me" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link prefetch={false} href="/" className="brand" aria-label="Shaik Aakif, home">
          <span className="brand-mark" aria-hidden="true">
            SA
          </span>
          <span className="brand-name">Shaik Aakif</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link prefetch={false} key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link prefetch={false} href="/#contact" className="button button--primary button--small">
            Connect
            <ArrowUpRight width={15} height={15} />
          </Link>
          <button
            ref={triggerRef}
            type="button"
            className="profile-button"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="quick-menu"
            onClick={toggleMenu}
          >
            <GearIcon />
          </button>

          {open && (
            <div
              ref={menuRef}
              id="quick-menu"
              className="quick-menu"
              role="menu"
              onClick={(e) => e.stopPropagation()}
            >
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="quick-link"
                  prefetch={false}
                  role="menuitem"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
