"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, PersonIcon } from "@/components/ui/icons";

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
            type="button"
            className="profile-button"
            aria-label="Open quick links"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            <PersonIcon />
          </button>

          {open && (
            <div className="quick-menu" onClick={() => setOpen(false)}>
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="quick-link"
                  prefetch={false}
                  onClick={() => setOpen(false)}
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
