import cvJson from "../../data/cv.json";

import { getProfile } from "./profile";
import { getProjects } from "./projects";
import type {
  Cv,
  CvExperience,
  CvPrintSelection,
  CvSkillGroup,
  Milestone,
  Project,
} from "./types";

interface PrintConfig {
  detailedRoles?: number;
  maxProjects?: number;
  projectCategories?: string[];
  maxAchievements?: number;
}

/**
 * Picks what goes on the printed one-page CV. Nothing is written twice: the
 * projects come from projects.json and the achievements from cv.json, and the
 * "print" block in cv.json only says how many and which categories.
 *
 * Projects: featured ones in the listed categories, in site order.
 * Achievements: the ones marked featured first, then the most recent, and the
 * final list is shown newest first.
 */
function selectForPrint(
  config: PrintConfig,
  featured: Project[],
  achievements: Milestone[],
): CvPrintSelection {
  const categories = config.projectCategories ?? [];
  const relevant =
    categories.length > 0
      ? featured.filter((project) => categories.includes(project.category))
      : featured;

  const byDateDesc = (a: Milestone, b: Milestone) =>
    (b.date ?? "").localeCompare(a.date ?? "");
  const ranked = [
    ...achievements.filter((item) => item.featured).sort(byDateDesc),
    ...achievements.filter((item) => !item.featured).sort(byDateDesc),
  ];

  return {
    detailedRoles: config.detailedRoles ?? 4,
    projects: relevant.slice(0, config.maxProjects ?? 4),
    achievements: ranked.slice(0, config.maxAchievements ?? 5).sort(byDateDesc),
  };
}

export function getCv(): Cv {
  const cv = cvJson as {
    photo?: string;
    summary: string;
    contact: { email: string };
    print?: PrintConfig;
    experience: CvExperience[];
    skillGroups: CvSkillGroup[];
    achievements?: Milestone[];
  };

  // An empty achievements list is valid (a CV that leads with experience only).
  // Always newest first, whatever order the JSON is written in.
  const achievements = [...(cv.achievements ?? [])].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? ""),
  );
  const featuredProjects = getProjects().filter((project) => project.featured);

  return {
    profile: getProfile(),
    photo: cv.photo,
    summary: cv.summary,
    contact: cv.contact,
    experience: cv.experience,
    skillGroups: cv.skillGroups,
    achievements,
    featuredProjects,
    print: selectForPrint(cv.print ?? {}, featuredProjects, achievements),
  };
}
