"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, GearIcon } from "@/components/ui/icons";
import { profile } from "@/content/profile";

const links = [
  { href: "/work/", label: "Work", index: "01" },
  { href: "/about/", label: "About", index: "02" },
  { href: "/#contact", label: "Contact", index: "03" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="menu-button"
        aria-label="Open site menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <GearIcon />
      </button>

      <dialog
        ref={dialogRef}
        className="menu-dialog"
        aria-label="Site menu"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
      >
        <div className="menu-sheet">
          <div className="menu-top">
            <span className="eyebrow eyebrow--plain">Navigate / 2026</span>
            <button
              type="button"
              className="menu-close"
              aria-label="Close site menu"
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="menu-nav" aria-label="Mobile primary">
            {links.map((link) => (
<Link prefetch={false} 
                key={link.href}
                href={link.href}
                className="menu-link"
                onClick={() => setOpen(false)}
              >
                {link.label}
                <span>{link.index}</span>
              </Link>
            ))}
          </nav>

          <div className="menu-meta">
            <span className="eyebrow eyebrow--plain">Direct line</span>
            <a href={profile.emailHref}>{profile.email}</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
