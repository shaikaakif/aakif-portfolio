import Link from "next/link";
import { ContactSection } from "@/components/sections/contact-section";
import { Hero } from "@/components/sections/hero";
import { ArrowUpRight } from "@/components/ui/icons";
import { SectionHead } from "@/components/ui/section-head";
import { ProjectRail } from "@/components/work/project-rail";
import { projects } from "@/content/projects";

export default function HomePage() {
  const liveCount = projects.filter((project) => project.status === "Live").length;

  return (
    <>
      <Hero />

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[
            "AI products",
            "Full-stack systems",
            "Product strategy",
            "Computer vision",
            "Multi-agent workflows",
            "Calm interfaces",
            "AI products",
            "Full-stack systems",
            "Product strategy",
            "Computer vision",
            "Multi-agent workflows",
            "Calm interfaces",
          ].map((item, index) => (
            <span className="marquee-item" key={`${item}-${index}`}>
              {item}
              <span className="marquee-star">✳</span>
            </span>
          ))}
        </div>
      </div>

      <section className="section" id="selected-work" aria-labelledby="work-title">
        <div className="container">
          <SectionHead
            eyebrow="Selected work / 01"
            title={
              <span id="work-title">
                Products built to remove friction.
              </span>
            }
            description="A selection of AI platforms, full-stack products, and systems built from first principles — each one shaped around a real human problem."
            side={
              <>
                <span className="count-note">
                  {projects.length} products / {liveCount} live
                </span>
                <Link prefetch={false} href="/work/" className="text-link">
                  View all work
                  <ArrowUpRight />
                </Link>
              </>
            }
          />
          <ProjectRail projects={projects} />
        </div>
      </section>

      <ContactSection />
    </>
  );
}
