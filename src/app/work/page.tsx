import type { Metadata } from "next";
import Link from "next/link";
import { ContactSection } from "@/components/sections/contact-section";
import { ArrowUpRight } from "@/components/ui/icons";
import { SectionHead } from "@/components/ui/section-head";
import { ProjectCard } from "@/components/work/project-card";
import { experiments, projects } from "@/content/projects";
import { seo, workSeo } from "@/content/seo";

export const metadata: Metadata = {
  title: workSeo.title,
  description: workSeo.description,
  keywords: workSeo.keywords,
  alternates: {
    canonical: "/work/",
  },
  openGraph: {
    title: `${workSeo.title} | ${seo.title.split(" — ")[0]}`,
    description: workSeo.description,
    url: "/work/",
    type: "website",
  },
};

export default function WorkPage() {
  const liveCount = projects.filter((project) => project.status === "Live").length;

  return (
    <>
      <section className="page-hero" aria-labelledby="work-page-title">
        <div className="container">
          <p className="eyebrow">Work / the full index</p>
          <h1 className="display-title" id="work-page-title">
            Products, not promises.
          </h1>
          <div className="page-hero__sub">
            <p>
              Eleven products across AI, education, SaaS, computer vision,
              developer tools, and enterprise software. Ten are live. One is an
              enterprise case study.
            </p>
            <p>
              Every project below starts with a friction worth removing — not a
              technology looking for a reason to exist.
            </p>
          </div>
          <div className="page-hero__meta">
            <span className="role-pill">{projects.length} products</span>
            <span className="role-pill">{liveCount} live</span>
            <span className="role-pill">AI / full-stack / systems</span>
          </div>
        </div>
      </section>

      <section className="section" aria-label="All products">
        <div className="container">
          <div className="work-grid">
            {projects.map((project) => (
              <div className="reveal" key={project.slug}>
                <ProjectCard project={project} variant="grid" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight" aria-labelledby="experiments-title">
        <div className="container">
          <SectionHead
            eyebrow="Experiments / side quests"
            title={
              <span id="experiments-title">Range beyond the main index.</span>
            }
            description="Earlier experiments, community work, and tools built to learn a new layer of the craft."
            side={<span className="count-note">{experiments.length} projects</span>}
          />

          <div className="experiment-list">
            {experiments.map((experiment) => (
              <article className="experiment-row reveal" key={experiment.title}>
                <div>
                  <div className="experiment-title">
                    <h3>{experiment.title}</h3>
                    {experiment.note ? (
                      <span className="experiment-note">{experiment.note}</span>
                    ) : null}
                  </div>
                  <span className="experiment-category">
                    {experiment.category}
                  </span>
                </div>
                <div>
                  <p>{experiment.tagline}</p>
                  <div className="experiment-stack" aria-label="Technology stack">
                    {experiment.stack.map((item) => (
                      <span className="tag" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="work-foot-link">
            <Link href="/about/" className="text-link">
              Read the builder story
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  );
}
