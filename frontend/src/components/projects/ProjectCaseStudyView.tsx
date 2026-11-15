import Link from "next/link";
import { ArrowLeftIcon, ExternalIcon, GitHubIcon } from "@/components/ui/icons";
import PageHeader from "@/components/ui/PageHeader";
import type { ProjectCaseStudy } from "@/lib/project-case-studies";
import type { Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";

export default function ProjectCaseStudyView({
  project,
  study,
  related,
}: {
  project: Project;
  study: ProjectCaseStudy;
  related: Project[];
}) {
  return (
    <article className="project-study">
      <Link href="/projects" className="link-arrow link-arrow--back">
        <ArrowLeftIcon /> All projects
      </Link>
      <PageHeader eyebrow={`${project.category} · ${project.language}`} title={study.title}>
        {study.description}
      </PageHeader>
      <div className="btn-row">
        <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn">
          <GitHubIcon /> View source on GitHub <ExternalIcon />
        </a>
        <Link href="/cv" className="btn">About my experience</Link>
      </div>

      <div className="project-study__sections">
        <section aria-labelledby="project-problem">
          <h2 id="project-problem" className="section-title">The problem</h2>
          <div className="prose">{study.problem.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>

        <section aria-labelledby="project-architecture">
          <h2 id="project-architecture" className="section-title">Architecture</h2>
          <figure className="architecture" aria-labelledby="architecture-caption">
            <ol className="architecture__steps">
              {study.architecture.map((step) => (
                <li key={step.title} className="architecture__step">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
            <figcaption id="architecture-caption">{study.architectureCaption}</figcaption>
          </figure>
        </section>

        {study.walkthrough?.length ? (
          <section aria-labelledby="project-walkthrough">
            <h2 id="project-walkthrough" className="section-title">Walkthrough</h2>
            <div className="prose">
              <ol>
                {study.walkthrough.map((step) => (
                  <li key={step.title}>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    {step.commands?.length ? (
                      <pre><code>{step.commands.join("\n")}</code></pre>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="project-implementation">
          <h2 id="project-implementation" className="section-title">Implementation</h2>
          <div className="prose"><ul>{study.implementation.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </section>

        <section aria-labelledby="project-security">
          <h2 id="project-security" className="section-title">Security takeaways</h2>
          <div className="prose"><ul>{study.securityTakeaways.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </section>

        <section aria-labelledby="project-limitations">
          <h2 id="project-limitations" className="section-title">Scope and limitations</h2>
          <p className="lead lead--flush">{study.limitations}</p>
        </section>

        <section aria-labelledby="project-sources">
          <h2 id="project-sources" className="section-title">Source references</h2>
          <p className="meta-line">Source review: <time dateTime={study.reviewedAt}>{study.reviewedAt}</time></p>
          <ul className="project-study__sources">
            {study.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label}<ExternalIcon className="inline-link-icon" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="related-projects">
          <h2 id="related-projects" className="section-title">Related projects</h2>
          <ul className="card-grid">
            {related.map((item) => <li key={item.id}><ProjectCard project={item} headingLevel={3} /></li>)}
          </ul>
        </section>
      </div>
    </article>
  );
}
