import Image from "next/image";
import type { Project } from "@/content/types";

interface ProjectArtworkProps {
  project: Project;
  className?: string;
}

export function ProjectArtwork({ project, className }: ProjectArtworkProps) {
  return (
    <div
      className={`project-art project-art--${project.artwork}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <span className="art-label">Build / {project.index}</span>
      <span className="art-status">
        <span className="status-dot" />
        {project.status}
      </span>
      {project.image ? (
        <>
          <Image
            src={project.image}
            alt={project.title}
            className="project-image"
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            loading="lazy"
          />
          <span className="art-scrim" aria-hidden="true" />
        </>
      ) : (
        <>
          <span className="art-shape art-shape--a" />
          <span className="art-shape art-shape--b" />
          <span className="art-shape art-shape--c" />
          <span className="art-code">{project.code}</span>
        </>
      )}
    </div>
  );
}
