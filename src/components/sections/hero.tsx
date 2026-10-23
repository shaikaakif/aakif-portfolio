import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import { profile } from "@/content/profile";
import { FloatingPortrait } from "@/components/ui/floating-portrait";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="hero-topline">
            <span className="eyebrow eyebrow--plain">
              AI builder / product developer
            </span>
          </div>

          <h1 className="hero-title" id="hero-title">
            <span>Engineering useful</span>
            <span className="hero-title-accent">products that solve real problems.</span>
          </h1>

          <p className="hero-sub">{profile.subtitle}</p>

          <div className="hero-actions">
            <Link href="/work/" className="button button--primary">
              Explore products
              <ArrowUpRight />
            </Link>
            <a href="#contact" className="button button--ghost">
              Say hello
            </a>
          </div>
        </div>

        <div className="hero-art">
          <FloatingPortrait className="hero-portrait-wrapper" />
        </div>
      </div>

      <div className="container hero-foot">
        <span className="scroll-cue">Scroll to see the work</span>
        <span>Product strategy / Full-stack systems / Applied AI</span>
      </div>
    </section>
  );
}
