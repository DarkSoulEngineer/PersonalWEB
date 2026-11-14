import projectsJson from "../../data/projects.json";

import type { LanguageCount, Project } from "./types";

export const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5",
  C: "#8a8f98",
  "C++": "#f34b7d",
  Assembly: "#a07a3c",
  PowerShell: "#3d7ec7",
  MATLAB: "#e16737",
  JavaScript: "#f1e05a",
  Java: "#b07219",
};

export function languageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? "#8a8f98";
}

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
