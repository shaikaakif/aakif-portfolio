"use client";

import { useEffect, useRef, useState } from "react";

export function MobileHighlighter() {
  const [strokes, setStrokes] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const idRef = useRef(0);

  useEffect(() => {
    let raf: number;
    const handleTouch = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.changedTouches[0];
      const stroke = {
        id: idRef.current++,
        x: touch.clientX,
        y: touch.clientY,
      };
      setStrokes((prev) => [...prev, stroke]);

      raf = requestAnimationFrame(() => {
        setStrokes((prev) => prev.filter((s) => s.id !== stroke.id));
      });
    };

    window.addEventListener("touchstart", handleTouch, { passive: false });
    window.addEventListener("touchmove", handleTouch, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove", handleTouch);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="highlighter-canvas" aria-hidden="true">
      {strokes.map((s) => (
        <div
          key={s.id}
          className="highlighter-stroke"
          style={{
            left: `${s.x}px`,
            top: `${s.y}px`,
            width: "34px",
            height: "34px",
          }}
        />
      ))}
    </div>
  );
}
