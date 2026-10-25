"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProjectCard } from "@/components/work/project-card";
import type { Project } from "@/content/types";

interface ProjectRailProps {
  projects: Project[];
}

export function ProjectRail({ projects }: ProjectRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const total = projects.length;
  const current = projects[active] ?? projects[0];
  const timerRef = useRef<number | undefined>(undefined);
  const lastActiveIndexRef = useRef<number>(0);

  const AUTO_PLAY_INTERVAL = 2500;

  const scrollToIndex = useCallback(
    (index: number) => {
      const rail = railRef.current;
      if (!rail) return;

      const child = rail.children[index] as HTMLElement | undefined;
      if (!child) return;

      const railRect = rail.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      const left = rail.scrollLeft + childRect.left - railRect.left;

      rail.scrollTo({ left, behavior: "smooth" });
      setActive(index);
    },
    []
  );

  const move = useCallback(() => {
    const next = (activeRef.current + 1) % total;
    scrollToIndex(next);
  }, [total, scrollToIndex]);

  const startAutoplay = useCallback(() => {
    timerRef.current = window.setInterval(move, AUTO_PLAY_INTERVAL);
  }, [move]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prev = (activeRef.current - 1 + total) % total;
        scrollToIndex(prev);
      } else if (event.key === "Home") {
        event.preventDefault();
        scrollToIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        scrollToIndex(total - 1);
      }
    },
    [total, move, scrollToIndex]
  );

  // Sync active slide from scroll position
  const syncActiveFromScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const railRect = rail.getBoundingClientRect();
    const railCenter = railRect.left + rail.clientWidth / 2;
    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    Array.from(rail.children).forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - railCenter);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });

    if (nearest !== lastActiveIndexRef.current) {
      lastActiveIndexRef.current = nearest;
      setActive(nearest);
    }
  }, []);

  // Scroll listener on the rail for active sync
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.addEventListener("scroll", syncActiveFromScroll, { passive: true });
    return () => rail.removeEventListener("scroll", syncActiveFromScroll);
  }, [syncActiveFromScroll, total]);

  // Resize observer for re-centering on layout change
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(syncActiveFromScroll);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [syncActiveFromScroll, total]);

  // Keep ref in sync with active
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Scroll to start after mount
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || total === 0) return;
    rail.scrollLeft = 0;
  }, [total]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAutoplay();
  }, [stopAutoplay]);

  return (
    <div className="project-rail" role="region" aria-roledescription="carousel" aria-label="Selected projects">
      <div
        ref={railRef}
        id="project-rail"
        className="rail-track"
        tabIndex={0}
        aria-label="Project cards. Use the left and right arrow keys to navigate."
        onKeyDown={handleKeyDown}
        onMouseEnter={stopAutoplay}
        onMouseLeave={startAutoplay}
      >
        {projects.map((project) => (
          <ProjectCard project={project} key={project.slug} />
        ))}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {current ? `Project ${active + 1} of ${total}: ${current.title}` : `Project ${active + 1} of ${total}`}
      </p>
    </div>
  );
}
