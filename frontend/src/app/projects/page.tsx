import ProjectsView from "@/components/projects/ProjectsView";
import JsonLd from "@/components/ui/JsonLd";
import PageHeader from "@/components/ui/PageHeader";
import { getLanguageCounts, getProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { breadcrumbSchema, collectionPageSchema, projectListSchema } from "@/lib/structured-data";

const TITLE = "Projects";
const DESCRIPTION =
  "Open-source projects by Milchis Catalin-Marian (DarkSoulEngineer): CC1101 radio driver, RTSP to HTTP camera streaming, 2.4 GHz antenna design, Assembly and Python tools.";

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
      <PageHeader eyebrow="Open source" title="Projects">
        Security tooling, radio drivers, antenna design and automation scripts. Everything is
        public on GitHub.
      </PageHeader>
      <ProjectsView projects={projects} languages={languages} />
    </>
  );
}
