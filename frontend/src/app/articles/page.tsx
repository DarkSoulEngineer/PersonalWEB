import ArticlesView from "@/components/articles/ArticlesView";
import JsonLd from "@/components/ui/JsonLd";
import PageHeader from "@/components/ui/PageHeader";
import { getPostList, getTags, hasPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";

const TITLE = "Articles";
const DESCRIPTION =
  "Articles by Milchis Catalin-Marian on penetration testing, telecom, wireless security and hardware.";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/articles",
  noindex: !hasPosts(),
});

export default function ArticlesPage() {
  return (
    <>
      <JsonLd data={collectionPageSchema("/articles", `${TITLE} | ${SITE_NAME}`, DESCRIPTION)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/articles" },
        ])}
      />
      <PageHeader eyebrow="Writing" title="Articles">
        Thoughts, experiences and discoveries from my journey in cybersecurity, telecom and hardware.
      </PageHeader>
      <ArticlesView posts={getPostList()} tags={getTags()} />
    </>
  );
}
