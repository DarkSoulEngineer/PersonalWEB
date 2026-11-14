import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";
import JsonLd from "@/components/ui/JsonLd";
import Markdown from "@/components/ui/Markdown";
import PageHeader from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/format";
import { EMPTY_POST_SLUG, getPost, getPostSlugs, hasPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getPostSlugs();
  if (slugs.length === 0) return [{ slug: EMPTY_POST_SLUG }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!hasPosts()) {
    return { title: "Nothing published yet", robots: { index: false, follow: true } };
  }
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/posts/${post.id}`,
    type: "article",
    publishedTime: post.created_at ?? undefined,
    modifiedTime: post.updated_at ?? undefined,
    tags: post.tags,
  });
}

function BackLink() {
  return (
    <Link href="/articles" className="link-arrow link-arrow--back">
      <ArrowLeftIcon />
      All articles
    </Link>
  );
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!hasPosts()) {
    return (
      <>
        <PageHeader eyebrow="Articles" title="Nothing published yet">
          The archive is empty for now. New write-ups will appear here soon.
        </PageHeader>
        <BackLink />
      </>
    );
  }

  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="article">
      <JsonLd data={blogPostingSchema(post)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Articles", path: "/articles" },
          { name: post.title, path: `/posts/${post.id}` },
        ])}
      />
      <BackLink />
      <header className="page-header">
        {post.tags.length > 0 && (
          <div className="chip-row chip-row--tight">
            {post.tags.map((name) => (
              <Link key={name} href={`/articles?tag=${encodeURIComponent(name)}`} className="chip chip-sm">
                {name}
              </Link>
            ))}
          </div>
        )}
        <h1 className="page-title">{post.title}</h1>
        <p className="meta-line">
          <span>{post.author}</span>
          {post.created_at ? (
            <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
          ) : null}
          {post.updated_at ? (
            <span>
              Updated <time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time>
            </span>
          ) : null}
        </p>
      </header>
      <div className="prose">
        <Markdown content={post.content} />
      </div>
    </article>
  );
}
