"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CloseIcon,
  InfoIcon,
} from "@/components/ui/icons";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header__content">
        {eyebrow ? <p className="admin-eyebrow">{eyebrow}</p> : null}
        <h1 className="admin-page-title">{title}</h1>
        {description ? (
          <p className="admin-page-subtitle">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  );
}

export function AdminBadge({
  tone = "default",
  children,
}: {
  tone?: "default" | "published" | "draft" | "featured" | "danger";
  children: ReactNode;
}) {
  return (
    <span
      className={`admin-badge${
        tone === "default" ? "" : ` admin-badge--${tone}`
      }`}
    >
      {children}
    </span>
  );
}

export function AdminAlert({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error";
  children: ReactNode;
}) {
  const Icon =
    tone === "error"
      ? AlertCircleIcon
      : tone === "success"
        ? CheckCircleIcon
        : InfoIcon;

  return (
    <div
      className={`admin-alert${
        tone === "info" ? " admin-alert--info" : ` admin-alert--${tone}`
      }`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon width={17} height={17} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function AdminEmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      {icon}
      <p className="admin-empty__title">{title}</p>
      {text ? <p className="admin-empty__text">{text}</p> : null}
      {action}
    </div>
  );
}

export function AdminSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="admin-skeleton-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="admin-skeleton admin-skeleton--card" key={index} />
      ))}
    </div>
  );
}

export function AdminLoading({ label }: { label: string }) {
  return (
    <div className="admin-loading" role="status">
      <span className="admin-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function AdminField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="admin-field">
      <label className="admin-field__label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="admin-field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? <p className="admin-field__hint">{hint}</p> : null}
      {error ? (
        <p className="admin-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: string;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  push: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current.slice(-3), { id, tone, message }]);
      const timer = setTimeout(() => dismiss(id), 4500);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="admin-toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div
            className={`admin-toast admin-toast--${toast.tone}`}
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            {toast.tone === "success" ? (
              <CheckCircleIcon width={17} height={17} aria-hidden="true" />
            ) : toast.tone === "error" ? (
              <AlertCircleIcon width={17} height={17} aria-hidden="true" />
            ) : (
              <InfoIcon width={17} height={17} aria-hidden="true" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              className="admin-toast__close"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <CloseIcon width={14} height={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return context;
}
