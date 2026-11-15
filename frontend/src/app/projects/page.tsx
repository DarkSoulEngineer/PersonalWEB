import ProjectsView from "@/components/projects/ProjectsView";
import JsonLd from "@/components/ui/JsonLd";
import PageHeader from "@/components/ui/PageHeader";
import { getLanguageCounts, getProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { breadcrumbSchema, collectionPageSchema, projectListSchema } from "@/lib/structured-data";

const TITLE = "Security & Telecom Projects";
const DESCRIPTION =
  "Security, RF and telecom projects by Cătălin Milchiș: an ESP-IDF CC1101 driver, Modbus client and simulator, XDR_C2 research and source-backed case studies.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/projects" });

export default function ProjectsPage() {
  const projects = getProjects();
  const languages = getLanguageCounts();

  return (
    <>
      <JsonLd data={collectionPageSchema("/projects", `${TITLE} | ${SITE_NAME}`, DESCRIPTION)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/projects" },
        ])}
      />
      <JsonLd data={projectListSchema(projects)} />
      <PageHeader eyebrow="Personal projects" title="Security, RF & telecom projects">
        Personal projects exploring security tooling, radio drivers, antenna design, and
        automation scripts for research, experimentation, and learning.
      </PageHeader>
      <ProjectsView projects={projects} languages={languages} />
    </>
  );
}
