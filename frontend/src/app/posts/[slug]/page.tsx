import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/ui/Markdown";
import { formatDate } from "@/lib/format";
import { getPost, getPostSlugs, hasPosts, EMPTY_POST_SLUG } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getPostSlugs();
  // `output: "export"` requires at least one generated route per dynamic
  // segment, so an empty archive renders a placeholder instead of failing.
  if (slugs.length === 0) return [{ slug: EMPTY_POST_SLUG }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!hasPosts()) return { title: "Nothing published yet" };
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.content.split(/\n\s*\n/)[0]?.slice(0, 160) ?? undefined,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Empty archive: the sentinel slug exists only so `output: "export"` can
  // pre-render this route. Show a friendly state instead of a 404.
  if (!hasPosts()) {
    return (
      <div className="not-found">
        <h1 className="page-title">Nothing published yet</h1>
        <p className="page-lead">
          The article archive is empty for now. New posts will appear here as
          soon as they are written.
        </p>
        <Link href="/articles" className="btn">
          Back to articles
        </Link>
      </div>
    );
  }

  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="post">
      <Link href="/articles" className="post-back">
        <span aria-hidden>←</span>&nbsp;All articles
      </Link>

      <h1 className="page-title">{post.title}</h1>

      <p className="post-meta">
        <span>{post.author}</span>
        <time dateTime={post.created_at ?? undefined}>
          {formatDate(post.created_at)}
        </time>
        {post.updated_at ? <span>Updated {formatDate(post.updated_at)}</span> : null}
      </p>

      {post.tags.length > 0 && (
        <div className="chip-row post-tags">
          {post.tags.map((name) => (
            <Link
              key={name}
              href={`/articles?tag=${encodeURIComponent(name)}`}
              className="chip chip-sm"
            >
              {name}
            </Link>
          ))}
        </div>
      )}

      <div className="post-body">
        <Markdown content={post.content} />
      </div>
    </article>
  );
}
