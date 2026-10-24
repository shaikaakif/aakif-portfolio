import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "@/components/ui/icons";
import { ProjectArtwork } from "@/components/work/project-artwork";
import { getProject, projects } from "@/content/projects";
import { seo } from "@/content/seo";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return {
      title: "Project not found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: project.title,
    description: project.tagline,
    alternates: {
      canonical: `/work/${project.slug}/`,
    },
    openGraph: {
      title: `${project.title} | Shaik Aakif`,
      description: project.tagline,
      url: `/work/${project.slug}/`,
      type: "article",
      images: [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: seo.ogImageAlt,
        },
      ],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const index = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(index + 1) % projects.length];

  return (
    <>
      <section
        className={`case-hero tone-${project.tone}`}
        aria-labelledby="case-title"
      >
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link prefetch={false} href="/work/">
              <ArrowLeft width={13} height={13} />
              All work
            </Link>
            <span aria-hidden="true">/</span>
            <span>{project.category}</span>
          </nav>

          <p className="eyebrow">
            Project {project.index} / {project.category}
          </p>
          <h1 className="case-title" id="case-title">
            {project.title}
          </h1>
          <p className="case-tagline">{project.tagline}</p>

          <dl className="case-meta">
            <div className="case-meta__item">
              <dt>Status</dt>
              <dd>{project.status === "Live" ? "Live product" : "Case study"}</dd>
            </div>
            <div className="case-meta__item">
              <dt>Category</dt>
              <dd>{project.category}</dd>
            </div>
            <div className="case-meta__item">
              <dt>Core stack</dt>
              <dd>{project.stack.slice(0, 2).join(" / ")}</dd>
            </div>
            <div className="case-meta__item">
              <dt>Project outcome</dt>
              <dd>{project.metric}</dd>
            </div>
          </dl>

          <div className="case-art">
            <ProjectArtwork project={project} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="case-body">
            <div>
              <div className="case-split">
                <div>
                  <h2>The problem</h2>
                  <p>{project.problem}</p>
                </div>
                <div>
                  <h2>The approach</h2>
                  <p>{project.solution}</p>
                </div>
              </div>

              <div className="case-section case-overview">
                <p className="eyebrow">Overview</p>
                <h2>What it is.</h2>
                <p>{project.description}</p>
              </div>
            </div>

            <aside className="case-body__side" aria-label="Project details">
              <div className="case-impact">
                <span>Project outcome</span>
                <strong>{project.metric}</strong>
              </div>

              <div className="case-section">
                <h2>Stack</h2>
                <div className="case-stack">
                  {project.stack.map((item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="case-link-row">
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button button--primary"
                  >
                    View live product
                    <ArrowUpRight />
                  </a>
                ) : null}
                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button button--ghost"
                  >
                    View source
                    <ArrowUpRight />
                  </a>
                ) : null}
              </div>
            </aside>
          </div>

          {nextProject ? (
            <div className="next-project">
              <p>Next project</p>
              <Link prefetch={false} href={`/work/${nextProject.slug}/`}>
                {nextProject.title}
                <ArrowUpRight />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
