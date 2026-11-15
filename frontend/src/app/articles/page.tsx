import Link from "next/link";
import ArticlesView from "@/components/articles/ArticlesView";
import JsonLd from "@/components/ui/JsonLd";
import PageHeader from "@/components/ui/PageHeader";
import { getPostList, getTags, hasPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/structured-data";

const TITLE = "Articles";
const DESCRIPTION =
  "Introductory explainers and technical notes by Cătălin Milchiș on software-defined radio, CC1101 modules, Modbus and embedded systems security.";

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
        Technical articles and insights on radio communications, embedded systems, and security,
        informed by hands-on research and practical experience.
      </PageHeader>
      <section className="start-here" aria-labelledby="start-here-title">
        <h2 className="eyebrow" id="start-here-title">Start here</h2>
        <p className="text-sm text-muted">
          New to radio or industrial networks?
        </p>
        <ol className="start-here__list">
          <li>
            <Link href="/posts/what-is-software-defined-radio">What is software-defined radio?</Link>
            <span>Samples, I/Q, antennas and the limits of a cheap receiver.</span>
          </li>
          <li>
            <Link href="/posts/sub-ghz-radio-cc1101-basics">Sub-GHz radio for beginners</Link>
            <span>What a CC1101 does, why settings must match, and what packet mode hides.</span>
          </li>
          <li>
            <Link href="/posts/modbus-basics-local-lab">Modbus for beginners</Link>
            <span>The four data tables and a simulator lab you can run locally.</span>
          </li>
        </ol>
      </section>
      <ArticlesView posts={getPostList()} tags={getTags()} />
    </>
  );
}
