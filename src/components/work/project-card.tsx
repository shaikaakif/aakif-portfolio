import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import { ProjectArtwork } from "@/components/work/project-artwork";
import type { Project } from "@/content/types";

interface ProjectCardProps {
  project: Project;
  variant?: "rail" | "grid";
}

export function ProjectCard({ project, variant = "rail" }: ProjectCardProps) {
  return (
    <Link
      href={`/work/${project.slug}/`}
      className={`project-card tone-${project.tone}${variant === "grid" ? " project-card--grid" : ""}`}
    >
      <ProjectArtwork project={project} />
      <div className="project-card-body">
        <div className="project-kicker">
          <span>{project.category}</span>
          <span>{project.metric}</span>
        </div>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-tagline">{project.tagline}</p>
        <div className="project-card-foot">
          <div className="tag-row" aria-label="Technology stack">
            {project.stack.slice(0, 3).map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
          <span className="arrow-disc" aria-hidden="true">
            <ArrowUpRight />
          </span>
        </div>
      </div>
    </Link>
  );
}
