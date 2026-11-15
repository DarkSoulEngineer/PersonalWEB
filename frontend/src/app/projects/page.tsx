import ProjectsView from "@/components/projects/ProjectsView";
import JsonLd from "@/components/ui/JsonLd";
import PageHeader from "@/components/ui/PageHeader";
import { getLanguageCounts, getProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { breadcrumbSchema, collectionPageSchema, projectListSchema } from "@/lib/structured-data";

const TITLE = "Security & Telecom Projects";
const DESCRIPTION =
  "Security, RF and telecom projects by Milchiș Cătălin-Marian: CC1101 driver, Modbus CLI and RTSP-to-HLS case studies with architecture and security takeaways.";

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
      <PageHeader eyebrow="Open source" title="Security, RF & telecom projects">
        Security tooling, radio drivers, antenna design and automation scripts. Everything is
        public on GitHub.
      </PageHeader>
      <ProjectsView projects={projects} languages={languages} />
    </>
  );
}
