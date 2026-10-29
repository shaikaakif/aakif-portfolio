"use client";

import { type ReactNode } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { useDialogA11y } from "@/components/admin/ui/useDialogA11y";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useDialogA11y(open, onCancel);

  if (!open) return null;

  return (
    <div
      className="admin-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        ref={ref}
        className="admin-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-description"
      >
        <div className="admin-modal__header">
          <h2 className="admin-modal__title" id="admin-confirm-title">
            {title}
          </h2>
          <button
            type="button"
            className="admin-drawer__close"
            onClick={onCancel}
            aria-label="Close dialog"
            disabled={busy}
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
        <div className="admin-modal__body" id="admin-confirm-description">
          <div className="admin-confirm-text">{description}</div>
        </div>
        <div className="admin-modal__footer">
          <button
            type="button"
            className="admin-button admin-button--ghost"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-button ${
              tone === "danger"
                ? "admin-button--danger"
                : "admin-button--primary"
            }`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
