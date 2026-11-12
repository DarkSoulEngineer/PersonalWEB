import projectsJson from "../../data/projects.json";

import type { LanguageCount, Project } from "./types";

export function getProjects(): Project[] {
  return projectsJson as Project[];
}

export function getLanguageCounts(): LanguageCount[] {
  const counts = new Map<string, number>();
  for (const project of getProjects()) {
    counts.set(project.language, (counts.get(project.language) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language));
}
