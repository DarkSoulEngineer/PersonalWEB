"use client";

import { useState } from "react";
import { languageColor } from "@/lib/projects";
import type { LanguageCount, Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";

export default function ProjectsView({
  projects,
  languages,
}: {
  projects: Project[];
  languages: LanguageCount[];
}) {
  const [activeLanguage, setActiveLanguage] = useState("");

  const visible = activeLanguage
    ? projects.filter((p) => p.language === activeLanguage)
    : projects;

  return (
    <>
      <div className="chip-row" role="group" aria-label="Filter by language">
        <button
          type="button"
          onClick={() => setActiveLanguage("")}
          className="chip"
          aria-pressed={activeLanguage === ""}
        >
          All <span className="chip-count">{projects.length}</span>
        </button>
        {languages.map((l) => (
          <button
            key={l.language}
            type="button"
            onClick={() => setActiveLanguage(l.language)}
            className="chip"
            aria-pressed={activeLanguage === l.language}
          >
            <span className="lang-dot" style={{ backgroundColor: languageColor(l.language) }} aria-hidden />
            {l.language} <span className="chip-count">{l.count}</span>
          </button>
        ))}
      </div>

      <ul className="card-grid">
        {visible.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </>
  );
}
