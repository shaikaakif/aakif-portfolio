"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

interface FloatingPortraitProps {
  className?: string;
}

export function FloatingPortrait({ className }: FloatingPortraitProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const portraitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.querySelector(".hero");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const heroHeight = rect.height;
      const scrolled = window.scrollY;
      // Progress from 0 to 1 as hero scrolls out of view
      const progress = Math.max(0, Math.min(1, scrolled / (heroHeight * 0.6)));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const rotateX = scrollProgress * 15;
  const rotateY = scrollProgress * 8;
  const scale = 1 - scrollProgress * 0.12;
  const translateY = scrollProgress * 40;

  return (
    <div
      className={`floating-portrait ${className ?? ""}`}
      ref={portraitRef}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateY(${translateY}px)`,
        transition: "transform 0.1s ease-out",
      }}
    >
      <div className="portrait-frame">
        <Image
          src="/images/portrait-full.png"
          alt="Shaik Aakif"
          className="portrait-img"
          priority
          width={900}
          height={900}
        />
      </div>
      <span className="portrait-caption">Founder · Shaik Aakif</span>
    </div>
  );
}
