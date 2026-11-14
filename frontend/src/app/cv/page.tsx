import CvView from "@/components/cv/CvView";
import JsonLd from "@/components/ui/JsonLd";
import { getCv } from "@/lib/cv";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { breadcrumbSchema, profilePageSchema } from "@/lib/structured-data";

const TITLE = "CV";
const DESCRIPTION =
  "CV of Milchis Catalin-Marian: penetration tester at Arvato Systems Romania, telecom R&D at Mitel Networks and 4th-year Telecommunications student in Brasov. Experience, tools, projects and achievements.";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/cv",
  type: "profile",
});

export default function CvPage() {
  return (
    <>
      <JsonLd data={profilePageSchema("/cv", `${TITLE} | ${SITE_NAME}`, DESCRIPTION)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/cv" },
        ])}
      />
      <CvView cv={getCv()} />
    </>
  );
}
