import ProjectsView from "@/components/projects/ProjectsView";
import { getLanguageCounts, getProjects } from "@/lib/projects";

export const metadata = {
  title: "Projects",
  description:
    "A selection of public repositories, from radio drivers and Assembly to security tools.",
};

export default function ProjectsPage() {
  const projects = getProjects();
  const languages = getLanguageCounts();

  return <ProjectsView projects={projects} languages={languages} />;
}
