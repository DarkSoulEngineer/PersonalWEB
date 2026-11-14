import cvJson from "../../data/cv.json";

import { getProfile } from "./profile";
import { getProjects } from "./projects";
import type { Cv, CvExperience, CvSkillGroup, Milestone } from "./types";

export function getCv(): Cv {
  const cv = cvJson as {
    photo?: string;
    title?: string;
    summary: string;
    contact: { email: string };
    experience: CvExperience[];
    skillGroups: CvSkillGroup[];
    interests?: string[];
    achievements?: Milestone[];
  };

  return {
    profile: getProfile(),
    photo: cv.photo,
    title: cv.title,
    summary: cv.summary,
    contact: cv.contact,
    experience: cv.experience,
    skillGroups: cv.skillGroups,
    interests: cv.interests ?? [],
    achievements: cv.achievements ?? [],
    featuredProjects: getProjects().filter((project) => project.featured),
  };
}
