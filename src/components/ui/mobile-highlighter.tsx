"use client";

import { useEffect, useRef, useState } from "react";

interface Stroke {
  id: number;
  x: number;
  y: number;
}

const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, label, summary, [role='button'], .profile-card";

export function MobileHighlighter() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) return;

      const target = event.target as Element | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) return;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const stroke: Stroke = {
        id: idRef.current++,
        x: touch.clientX,
        y: touch.clientY,
      };

      setStrokes((prev) => [...prev.slice(-5), stroke]);

      const timer = window.setTimeout(() => {
        setStrokes((prev) => prev.filter((item) => item.id !== stroke.id));
        timersRef.current = timersRef.current.filter((item) => item !== timer);
      }, 700);
      timersRef.current.push(timer);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  return (
    <div className="highlighter-canvas" aria-hidden="true">
      {strokes.map((stroke) => (
        <div
          key={stroke.id}
          className="highlighter-stroke"
          style={{
            left: `${stroke.x}px`,
            top: `${stroke.y}px`,
            width: "34px",
            height: "34px",
          }}
        />
      ))}
    </div>
  );
}
