import Link from "next/link";
import { ArrowRightIcon, ExternalIcon } from "@/components/ui/icons";
import { formatDateOnly } from "@/lib/format";
import { languageColor } from "@/lib/projects";
import type { Project } from "@/lib/types";
import { projectDetailPath } from "@/lib/project-routes";

export default function ProjectCard({ project, headingLevel = 2 }: { project: Project; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const detailPath = projectDetailPath(project.id);

  return (
    <article className="card card-interactive">
      <div className="card-meta">
        <span className="lang">
          <span className="lang-dot" style={{ backgroundColor: languageColor(project.language) }} aria-hidden />
          {project.language}
        </span>
        <span>{project.category}</span>
      </div>
      <Heading className="card-title">
        {detailPath ? (
          <Link href={detailPath} className="stretched-link">{project.name}</Link>
        ) : (
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="stretched-link">
            {project.name}
          </a>
        )}
        {detailPath ? <ArrowRightIcon className="card-title-icon" /> : <ExternalIcon className="card-title-icon" />}
      </Heading>
      <p className="card-text">{project.description}</p>
      <p className="card-foot">
        {project.github_updated_at ? (
          <span>Updated <time dateTime={project.github_updated_at}>{formatDateOnly(project.github_updated_at)}</time></span>
        ) : null}
        {detailPath ? (
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="card-source" aria-label={`${project.name} source on GitHub`}>
            Source on GitHub
          </a>
        ) : null}
      </p>
    </article>
  );
}
