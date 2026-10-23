"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function BrushGlowTracker() {
  const glowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const handleMove = useCallback((event: PointerEvent) => {
    const glow = glowRef.current;
    if (!glow) return;
    glow.style.setProperty("--brush-x", `${event.clientX}px`);
    glow.style.setProperty("--brush-y", `${event.clientY}px`);
    if (!visible) setVisible(true);
  }, [visible]);

  const handleLeave = useCallback(() => setVisible(false), []);

  useEffect(() => {
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
    };
  }, [handleMove, handleLeave]);

  return (
    <div
      ref={glowRef}
      className={`brush-glow${visible ? " brush-glow--visible" : ""}`}
      aria-hidden="true"
    />
  );
}
