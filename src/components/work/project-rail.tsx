"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, PauseIcon, PlayIcon } from "@/components/ui/icons";
import { ProjectCard } from "@/components/work/project-card";
import type { Project } from "@/content/types";

interface ProjectRailProps {
  projects: Project[];
  sectionVisible?: boolean;
}

export function ProjectRail({ projects, sectionVisible = false }: ProjectRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const total = projects.length;
  const current = projects[active] ?? projects[0];
  const timerRef = useRef<number | undefined>(undefined);
  const rafRef = useRef<number | undefined>(undefined);
  const scrollRafRef = useRef<number | undefined>(undefined);
  const lastActiveIndexRef = useRef<number>(0);

  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Keep ref in sync with active for stale-free reads in event handlers
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const cancelScrollAnimation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
    if (scrollRafRef.current) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = undefined;
    }
    setIsAnimating(false);
  }, []);

  // Sync active slide from scroll position (throttled via rAF to avoid continuous state updates)
  const syncActiveFromScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail || isAnimating) return;

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
  }, [isAnimating]);

  const throttledSync = useCallback(() => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = undefined;
      syncActiveFromScroll();
    });
  }, [syncActiveFromScroll]);

  // Spring-based scroll to a target index
  const scrollToIndex = useCallback(
    (index: number, useSpring: boolean = true) => {
      cancelScrollAnimation();
      const rail = railRef.current;
      if (!rail) return;

      const child = rail.children[index] as HTMLElement | undefined;
      if (!child) return;

      const railRect = rail.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      const targetLeft = rail.scrollLeft + childRect.left - railRect.left;
      const startLeft = rail.scrollLeft;
      const distance = targetLeft - startLeft;

      if (Math.abs(distance) < 1) {
        setActive(index);
        return;
      }

      if (reduced || !useSpring) {
        rail.scrollTo({ left: targetLeft, behavior: "auto" });
        setActive(index);
        return;
      }

      const duration = reduced ? 200 : 500;
      const startTime = performance.now();

      // Slight overshoot spring ease (cubic-bezier(0.34, 1.56, 0.64, 1) approximation)
      const ease = (t: number) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };

      setIsAnimating(true);
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = ease(progress);
        rail.scrollLeft = startLeft + distance * eased;

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          rail.scrollLeft = targetLeft;
          setIsAnimating(false);
          setActive(index);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    },
    [cancelScrollAnimation, reduced]
  );

  const move = useCallback(
    (direction: -1 | 1) => {
      const next = (activeRef.current + direction + total) % total;
      scrollToIndex(next, true);
    },
    [total, scrollToIndex]
  );

  const startAutoplay = useCallback(() => {
    if (isPaused || !railRef.current) return;
    timerRef.current = window.setInterval(() => move(1), 4000);
  }, [isPaused, move]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay, isPaused]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        cancelScrollAnimation();
        move(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        cancelScrollAnimation();
        move(-1);
      } else if (event.key === "Home") {
        event.preventDefault();
        cancelScrollAnimation();
        scrollToIndex(0, true);
      } else if (event.key === "End") {
        event.preventDefault();
        cancelScrollAnimation();
        scrollToIndex(total - 1, true);
      }
    },
    [total, move, scrollToIndex, cancelScrollAnimation]
  );

  const toggleAutoplay = () => setIsPaused((prev) => !prev);

  // Scroll listener on the rail for active sync
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.addEventListener("scroll", throttledSync, { passive: true });
    return () => rail.removeEventListener("scroll", throttledSync);
  }, [throttledSync, total]);

  // Resize observer for re-centering on layout change
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(throttledSync);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [throttledSync, total]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelScrollAnimation();
      stopAutoplay();
    };
  }, [cancelScrollAnimation, stopAutoplay]);

  // Scroll to start after mount
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || total === 0) return;
    rail.scrollLeft = 0;
  }, [total]);

  const indicators = projects.map((_, index) => (
    <button
      key={index}
      type="button"
      aria-label={`Go to project ${index + 1}: ${projects[index].title}`}
      aria-current={index === active ? "true" : undefined}
      className={`pill-indicator${index === active ? " pill-indicator--active" : ""}`}
      onClick={() => {
        cancelScrollAnimation();
        scrollToIndex(index, true);
      }}
    />
  ));

  const pillContent = (
    <div className="pill" aria-label="Project navigation">
      <div className="pill-inner">
        <button
          type="button"
          className="pill-button pill-button--nav"
          aria-label="Previous project"
          aria-controls="project-rail"
          onClick={() => {
            cancelScrollAnimation();
            move(-1);
          }}
          disabled={isAnimating}
        >
          <ArrowLeft className="pill-icon" />
        </button>

        <div className="pill-indicators" role="tablist" aria-label="Project slides">
          {indicators}
        </div>

        <button
          type="button"
          className="pill-button pill-button--toggle"
          aria-label={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
          aria-pressed={!isPaused}
          onClick={toggleAutoplay}
        >
          {isPaused ? <PlayIcon className="pill-icon" /> : <PauseIcon className="pill-icon" />}
        </button>

        <button
          type="button"
          className="pill-button pill-button--nav"
          aria-label="Next project"
          aria-controls="project-rail"
          onClick={() => {
            cancelScrollAnimation();
            move(1);
          }}
          disabled={isAnimating}
        >
          <ArrowRight className="pill-icon" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="project-rail" role="region" aria-roledescription="carousel" aria-label="Selected projects">
      <div
        ref={railRef}
        id="project-rail"
        className="rail-track"
        tabIndex={0}
        aria-label="Project cards. Use the left and right arrow keys to navigate."
        onKeyDown={handleKeyDown}
        onMouseEnter={() => stopAutoplay()}
        onMouseLeave={() => startAutoplay()}
      >
        {projects.map((project) => (
          <ProjectCard project={project} key={project.slug} />
        ))}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {current ? `Project ${active + 1} of ${total}: ${current.title}` : `Project ${active + 1} of ${total}`}
      </p>

      {sectionVisible && pillContent}
    </div>
  );
}
