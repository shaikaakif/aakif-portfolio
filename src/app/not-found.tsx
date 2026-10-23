import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="container not-found__inner">
        <span className="not-found__code">404 / wrong turn</span>
        <h1>That page doesn&apos;t exist.</h1>
        <p>
          The link may have moved, or the product is still being built. The
          useful route is back to the work.
        </p>
        <div className="contact-actions">
          <Link href="/" className="button button--primary">
            Back home
            <ArrowUpRight />
          </Link>
          <Link href="/work/" className="button button--ghost">
            Explore the work
          </Link>
        </div>
      </div>
    </section>
  );
}
