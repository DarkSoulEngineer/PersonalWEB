import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectCaseStudyView from "@/components/projects/ProjectCaseStudyView";
import JsonLd from "@/components/ui/JsonLd";
import { getProjects } from "@/lib/projects";
import { getProjectCaseStudy, PROJECT_CASE_STUDIES } from "@/lib/project-case-studies";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, projectCaseStudySchema } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECT_CASE_STUDIES.map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getProjectCaseStudy(slug);
  if (!study) notFound();
  return pageMetadata({
    title: study.metaTitle,
    description: study.description,
    path: `/projects/${study.slug}`,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const study = getProjectCaseStudy(slug);
  if (!study) notFound();
  const projects = getProjects();
  const project = projects.find(({ id }) => id === study.projectId);
  if (!project) notFound();
  const related = projects.filter((item) =>
    item.id !== project.id && PROJECT_CASE_STUDIES.some((entry) => entry.projectId === item.id));

  return (
    <>
      <JsonLd data={projectCaseStudySchema(project, study)} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Projects", path: "/projects" },
        { name: project.name, path: `/projects/${study.slug}` },
      ])} />
      <ProjectCaseStudyView project={project} study={study} related={related} />
    </>
  );
}
