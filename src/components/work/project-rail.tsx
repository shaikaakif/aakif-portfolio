"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, PauseIcon, PlayIcon } from "@/components/ui/icons";
import { ProjectCard } from "@/components/work/project-card";
import type { Project } from "@/content/types";

interface ProjectRailProps {
  projects: Project[];
}

export function ProjectRail({ projects }: ProjectRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const total = projects.length;
  const current = projects[active] ?? projects[0];
  const timerRef = useRef<number | undefined>(undefined);

  const updateActive = useCallback(() => {
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

    setActive(nearest);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const observer = new ResizeObserver(updateActive);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [updateActive]);

  const scrollToIndex = useCallback((index: number) => {
    const rail = railRef.current;
    if (!rail) return;

    const child = rail.children[index] as HTMLElement | undefined;
    if (!child) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const railRect = rail.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    const left = rail.scrollLeft + childRect.left - railRect.left;

    rail.scrollTo({
      left,
      behavior: reduced ? "auto" : "smooth",
    });
  }, []);

  const move = useCallback(
    (direction: -1 | 1) => {
      const next = (active + direction + projects.length) % projects.length;
      scrollToIndex(next);
    },
    [active, projects.length, scrollToIndex],
  );

  const startAutoplay = useCallback(() => {
    if (!autoplay || hovered) return;
    timerRef.current = window.setInterval(() => move(1), 4000);
  }, [autoplay, hovered, move]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay, autoplay, hovered]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      scrollToIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      scrollToIndex(total - 1);
    }
  };

  const toggleAutoplay = () => setAutoplay((prev) => !prev);

  return (
    <div
      className="project-rail"
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected projects"
    >
      <div
        ref={railRef}
        id="project-rail"
        className="rail-track"
        tabIndex={0}
        aria-label="Project cards. Use the left and right arrow keys to navigate."
        onScroll={updateActive}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => {
          setHovered(true);
          stopAutoplay();
        }}
        onMouseLeave={() => {
          setHovered(false);
          startAutoplay();
        }}
      >
        {projects.map((project) => (
          <ProjectCard project={project} key={project.slug} />
        ))}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {current
          ? `Project ${active + 1} of ${total}: ${current.title}`
          : `Project ${active + 1} of ${total}`}
      </p>

      <div className="rail-controls">
        <div className="rail-progress">
          <div
            className="rail-progress__track"
            role="progressbar"
            aria-label="Project carousel position"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={active + 1}
          >
            <span
              className="rail-progress__fill"
              style={{ width: `${((active + 1) / total) * 100}%` }}
            />
          </div>
          <span className="rail-count">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className="rail-buttons">
          <button
            type="button"
            className="rail-button"
            aria-label="Previous project"
            aria-controls="project-rail"
            onClick={() => move(-1)}
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            className="rail-button"
            aria-label={autoplay ? "Pause auto-scroll" : "Resume auto-scroll"}
            aria-controls="project-rail"
            onClick={toggleAutoplay}
          >
            {autoplay ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            className="rail-button"
            aria-label="Next project"
            aria-controls="project-rail"
            onClick={() => move(1)}
          >
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
