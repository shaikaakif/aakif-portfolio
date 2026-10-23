"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";
import { profile } from "@/content/profile";

type CopyStatus = "idle" | "copied" | "error";

export function CopyEmail() {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setStatus("copied");
    } catch {
      setStatus("error");
    }

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setStatus("idle"), 2600);
  }

  const label =
    status === "copied"
      ? "Copied"
      : status === "error"
        ? "Copy failed"
        : "Copy email";

  return (
    <>
      <button type="button" className="copy-button" onClick={handleCopy}>
        {status === "copied" ? <CheckIcon /> : <CopyIcon />}
        {label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {status === "copied"
          ? "Email address copied to clipboard."
          : status === "error"
            ? "Email address could not be copied."
            : ""}
      </span>
    </>
  );
}
