import Link from "next/link";
import { profile } from "@/content/profile";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p className="footer-copy">
          © 2026 Shaik Aakif. Designed and built with intention.
        </p>
        <nav className="footer-nav" aria-label="Footer">
          <Link prefetch={false} href="/work/">Work</Link>
          <Link prefetch={false} href="/about/">About</Link>
          <Link prefetch={false} href="/#contact">Contact</Link>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <Link
            prefetch={false}
            href="/admin"
            className="admin-link"
            aria-label="Site editor"
          >
            .editor
          </Link>
        </nav>
      </div>
    </footer>
  );
}
