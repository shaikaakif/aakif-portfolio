"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { profile } from "@/content/profile";

interface ProfileCardProps {
  className?: string;
}

interface PointerStart {
  id: number;
  x: number;
  y: number;
}

const SWIPE_THRESHOLD = 48;

export function ProfileCard({ className }: ProfileCardProps) {
  const [flipped, setFlipped] = useState(false);
  const pointerStart = useRef<PointerStart | null>(null);
  const autoFlipped = useRef(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const target = event.target as Element;
    if (target.closest("a, button")) return;

    pointerStart.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || start.id !== event.pointerId) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const horizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

    if (!horizontal || Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    setFlipped(deltaX < 0);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && flipped) setFlipped(false);
  };

  useEffect(() => {
    if (autoFlipped.current) return;
    autoFlipped.current = true;

    const flipForward = setTimeout(() => {
      setFlipped(true);
    }, 1600);

    const flipBack = setTimeout(() => {
      setFlipped(false);
    }, 4000);

    return () => {
      clearTimeout(flipForward);
      clearTimeout(flipBack);
    };
  }, []);

  return (
    <div
      className={`profile-card${className ? ` ${className}` : ""}`}
      data-flipped={flipped}
      role="group"
      aria-label="Interactive profile card for Shaik Aakif"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="profile-card__inner">
        <div
          className="profile-card__face profile-card__front"
          inert={flipped}
          aria-hidden={flipped}
        >
          <Image
            src="/images/my-photo.webp"
            alt="Shaik Aakif seated by a window in a brown overshirt"
            className="profile-card__photo"
            fill
            priority
            draggable={false}
            sizes="(max-width: 48rem) 90vw, 25rem"
          />
          <span className="profile-card__shade" aria-hidden="true" />

          <div className="profile-card__front-top">
            <span className="profile-card__hint">Swipe to flip</span>
          </div>

          <div className="profile-card__front-meta">
            <div>
              <p className="profile-card__front-name">Shaik Aakif</p>
              <p className="profile-card__front-role">Founder &amp; Developer</p>
            </div>
            <button
              type="button"
              className="profile-card__flip"
              aria-label="Show profile details"
              aria-pressed={false}
              aria-controls="profile-card-details"
              onClick={() => setFlipped(true)}
            >
              <span>Flip</span>
            </button>
          </div>
        </div>

        <div
          className="profile-card__face profile-card__back"
          id="profile-card-details"
          inert={!flipped}
          aria-hidden={!flipped}
        >
          <div className="profile-card__back-top">
            <span className="profile-card__eyebrow">Founder / builder</span>
            <button
              type="button"
              className="profile-card__flip profile-card__flip--back"
              aria-label="Show portrait"
              aria-pressed
              onClick={() => setFlipped(false)}
            >
              <span>Portrait</span>
            </button>
          </div>

          <div className="profile-card__back-body">
            <p className="profile-card__name">Shaik Aakif</p>
            <p className="profile-card__role">Founder &amp; Developer</p>
            <p className="profile-card__intro">{profile.intro}</p>
          </div>

          <div className="profile-card__back-actions">
            <a href={profile.emailHref} className="button button--primary">
              Connect
              <ArrowUpRight />
            </a>
            <Link prefetch={false} href="/about/" className="profile-card__story">
              Read the story
              <ArrowUpRight width={15} height={15} />
            </Link>
          </div>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {flipped ? "Showing profile details." : "Showing portrait."}
      </p>
    </div>
  );
}
