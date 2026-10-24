import Link from "next/link";
import { ArrowUpRight, GearIcon } from "@/components/ui/icons";

const navItems = [
  { href: "/work/", label: "Work" },
  { href: "/about/", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
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
          <Link prefetch={false} href="/admin/" className="button button--ghost button--small" aria-label="Open admin dashboard">
            <GearIcon />
          </Link>
        </div>
      </div>
    </header>
  );
}
