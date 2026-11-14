import { ExternalIcon } from "@/components/ui/icons";
import { formatDateOnly } from "@/lib/format";
import { languageColor } from "@/lib/projects";
import type { Project } from "@/lib/types";

export default function ProjectCard({ project, headingLevel = 2 }: { project: Project; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

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
        <a href={project.url} target="_blank" rel="noopener noreferrer" className="stretched-link">
          {project.name}
        </a>
        <ExternalIcon className="card-title-icon" />
      </Heading>
      <p className="card-text">{project.description}</p>
      {project.github_updated_at ? (
        <p className="card-foot">
          Updated <time dateTime={project.github_updated_at}>{formatDateOnly(project.github_updated_at)}</time>
        </p>
      ) : null}
    </article>
  );
}
