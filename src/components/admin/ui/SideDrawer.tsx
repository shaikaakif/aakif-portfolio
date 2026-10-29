"use client";

import { type ReactNode } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { useDialogA11y } from "@/components/admin/ui/useDialogA11y";

interface SideDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export function SideDrawer({
  open,
  title,
  subtitle,
  onClose,
  footer,
  children,
}: SideDrawerProps) {
  const ref = useDialogA11y(open, onClose);

  if (!open) return null;

  return (
    <>
      <div className="admin-drawer-overlay" aria-hidden="true" onClick={onClose} />
      <aside
        ref={ref}
        className="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-drawer-title"
      >
        <header className="admin-drawer__header">
          <div>
            <h2 className="admin-drawer__title" id="admin-drawer-title">
              {title}
            </h2>
            {subtitle ? (
              <p className="admin-drawer__subtitle">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="admin-drawer__close"
            onClick={onClose}
            aria-label="Close panel"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </header>
        <div className="admin-drawer__body">{children}</div>
        {footer ? <footer className="admin-drawer__footer">{footer}</footer> : null}
      </aside>
    </>
  );
}
