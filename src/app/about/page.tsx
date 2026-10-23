import type { Metadata } from "next";
import Link from "next/link";
import { ContactSection } from "@/components/sections/contact-section";
import { ArrowUpRight } from "@/components/ui/icons";
import { SectionHead } from "@/components/ui/section-head";
import {
  achievements,
  focusDomains,
  principles,
  profile,
  teamRoles,
  timeline,
} from "@/content/profile";
import { aboutSeo, seo } from "@/content/seo";

export const metadata: Metadata = {
  title: aboutSeo.title,
  description: aboutSeo.description,
  keywords: aboutSeo.keywords,
  alternates: {
    canonical: "/about/",
  },
  openGraph: {
    title: `${aboutSeo.title} | ${seo.title.split(" — ")[0]}`,
    description: aboutSeo.description,
    url: "/about/",
    type: "profile",
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero" aria-labelledby="about-title">
        <div className="container">
          <p className="eyebrow">Profile / the builder</p>
          <h1 className="display-title" id="about-title">
            I don&apos;t just write code. I build products.
          </h1>
          <div className="page-hero__sub">
            <p>{profile.intro}</p>
          </div>
          <div className="page-hero__meta">
            {profile.rolePills.map((pill) => (
              <span className="role-pill" key={pill}>
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="story-title">
        <div className="container">
          <div className="about-story">
            <div className="about-story__label">
              <p className="eyebrow">The story / 01</p>
              <h2 className="sr-only" id="story-title">
                The story
              </h2>
            </div>
            <div className="about-story__body reveal">
              {profile.bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="pull-quote">
                <blockquote>&ldquo;{profile.quote}&rdquo;</blockquote>
                <cite>Shaik Aakif / builder philosophy</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight" aria-labelledby="principles-about-title">
        <div className="container">
          <SectionHead
            eyebrow="Operating principles / 02"
            title={<span id="principles-about-title">The work behind the work.</span>}
            description="Four rules that shape how products get scoped, built, and shipped."
          />
          <ol className="principle-list">
            {principles.map((principle) => (
              <li className="principle-row reveal" key={principle.index}>
                <span className="principle-index">{principle.index}</span>
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="timeline-title">
        <div className="container">
          <SectionHead
            eyebrow="Evolution / 03"
            title={<span id="timeline-title">A short timeline of getting useful.</span>}
            side={<span className="count-note">2023 — present</span>}
          />
          <div className="timeline">
            {timeline.map((entry) => (
              <article className="timeline-row reveal" key={entry.year}>
                <span className="timeline-year">{entry.year}</span>
                <div className="timeline-row__body">
                  <h3>{entry.title}</h3>
                  <span className="timeline-role">{entry.role}</span>
                  <p>{entry.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight" aria-labelledby="honors-title">
        <div className="container">
          <SectionHead
            eyebrow="Honors / 04"
            title={<span id="honors-title">A few markers along the way.</span>}
            description="Recognition is not the goal. It is a useful signal that the work is landing."
          />
          <div className="achievement-grid">
            {achievements.map((achievement) => (
              <article className="achievement-card reveal" key={achievement.title}>
                <div className="achievement-card__meta">
                  <span>{achievement.category}</span>
                  {achievement.year ? <span>{achievement.year}</span> : null}
                </div>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="team-title">
        <div className="container">
          <SectionHead
            eyebrow="Operating model / 05"
            title={<span id="team-title">One founder. A specialist AI team.</span>}
            description="I act as chief executive and product architect, directing specialized agents through strategy, logic, research, and execution."
            side={<span className="count-note">Human judgment stays central</span>}
          />
          <div className="team-list">
            {teamRoles.map((role) => (
              <div className="team-row reveal" key={role.agent}>
                <div className="team-row__descriptor">
                  <span className="team-role">{role.role}</span>
                  <div className="team-agent">
                    <strong>{role.agent}</strong>
                    <span>{role.badge}</span>
                  </div>
                </div>
                <p>{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight" aria-labelledby="foundations-title">
        <div className="container">
          <SectionHead
            eyebrow="Foundations / 06"
            title={<span id="foundations-title">Where the range comes from.</span>}
            side={
              <Link href="/work/" className="text-link">
                See the products
                <ArrowUpRight />
              </Link>
            }
          />
          <div className="education-row">
            <h3>{profile.education.degree}</h3>
            <p>{profile.education.specialization}</p>
          </div>
          <div className="page-hero__meta foundation-pills">
            {focusDomains.map((domain) => (
              <span className="role-pill" key={domain.index}>
                {domain.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  );
}
