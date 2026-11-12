"use client";

import { useState } from "react";
import SearchBox from "@/components/ui/SearchBox";
import { formatDate } from "@/lib/format";
import { languageColor } from "@/lib/languages";
import { matchesQuery } from "@/lib/search";
import type { LanguageCount, Project } from "@/lib/types";

export default function ProjectsView({
  projects,
  languages,
}: {
  projects: Project[];
  languages: LanguageCount[];
}) {
  const [activeLanguage, setActiveLanguage] = useState("");
  const [query, setQuery] = useState("");

  const visible = projects.filter(
    (project) =>
      (!activeLanguage || project.language === activeLanguage) &&
      matchesQuery(query, [
        project.name,
        project.description,
        project.language,
        project.category,
        ...(project.stack ?? []),
      ]),
  );

  function clearFilters() {
    setQuery("");
    setActiveLanguage("");
  }

  if (projects.length === 0) {
    return (
      <>
        <header className="page-head">
          <h1 className="page-title">Projects</h1>
        </header>
        <div className="empty-state">
          <p className="empty-state__title">No projects yet</p>
          <p className="empty-state__text">
            Public repositories will be listed here once they are added. Until
            then, everything I publish is on GitHub.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="page-head">
        <h1 className="page-title">Projects</h1>
        <p className="page-lead">
          {projects.length} public repositories, from sub-GHz radio drivers and
          antenna design to Assembly and security tooling.
        </p>
      </header>

      <div className="list-tools">
        <SearchBox
          value={query}
          onChange={setQuery}
          label="Search projects"
          placeholder="Search projects"
        />
      </div>

      <div className="chip-row" role="group" aria-label="Filter by language">
        <button
          type="button"
          onClick={() => setActiveLanguage("")}
          aria-pressed={activeLanguage === ""}
          className="chip"
        >
          All <span className="chip-count">{projects.length}</span>
        </button>
        {languages.map(({ language, count }) => (
          <button
            key={language}
            type="button"
            onClick={() => setActiveLanguage(language)}
            aria-pressed={activeLanguage === language}
            className="chip"
          >
            <span
              className="lang-dot"
              aria-hidden
              style={{ backgroundColor: languageColor(language) }}
            />
            {language} <span className="chip-count">{count}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No projects found</p>
          <p className="empty-state__text">
            {query
              ? `Nothing matches “${query.trim()}”${activeLanguage ? ` in ${activeLanguage}` : ""}. Try another word or clear the search.`
              : `No ${activeLanguage} projects yet.`}
          </p>
          <button type="button" className="btn" onClick={clearFilters}>
            Show all projects
          </button>
        </div>
      ) : (
        <ul className="rows">
          {visible.map((project) => (
            <li key={project.id} className="row row--link">
              <div className="row__meta">
                <span className="row__lang">
                  <span
                    className="lang-dot"
                    aria-hidden
                    style={{ backgroundColor: languageColor(project.language) }}
                  />
                  {project.language}
                </span>
                <span>{formatDate(project.github_updated_at?.slice(0, 10))}</span>
              </div>
              <div>
                <h2 className="row__title">
                  <a href={project.url} target="_blank" rel="noopener noreferrer">
                    {project.name}
                  </a>
                </h2>
                <p className="row__desc">{project.description}</p>
                {project.stack?.length ? (
                  <p className="row__stack">{project.stack.join(" / ")}</p>
                ) : null}
              </div>
              <span className="row__arrow" aria-hidden>
                ↗
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
