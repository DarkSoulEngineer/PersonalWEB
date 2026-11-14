"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/format";
import type { PostListItem, Tag } from "@/lib/types";

const PAGE_SIZE = 6;

export default function ArticlesView({ posts, tags }: { posts: PostListItem[]; tags: Tag[] }) {
  const [activeTag, setActiveTag] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const applyFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setPage(1);
      setActiveTag(params.get("tag") ?? "");
    };
    applyFromUrl();
    window.addEventListener("popstate", applyFromUrl);
    return () => window.removeEventListener("popstate", applyFromUrl);
  }, []);

  const filtered = posts.filter((post) => !activeTag || post.tags.includes(activeTag));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visiblePosts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function selectTag(name: string) {
    setPage(1);
    setActiveTag(name === activeTag ? "" : name);
  }

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p className="font-semibold">No articles published yet</p>
        <p className="text-sm text-muted">New write-ups will appear here soon.</p>
      </div>
    );
  }

  return (
    <>
      {tags.length > 0 && (
        <div className="chip-row" role="group" aria-label="Filter by tag">
          <button type="button" onClick={() => selectTag("")} className="chip" aria-pressed={activeTag === ""}>
            All <span className="chip-count">{posts.length}</span>
          </button>
          {tags.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTag(t.name)}
              className="chip"
              aria-pressed={activeTag === t.name}
            >
              {t.name} <span className="chip-count">{t.posts_count}</span>
            </button>
          ))}
        </div>
      )}

      {visiblePosts.length === 0 ? (
        <div className="empty-state">
          <p className="text-sm text-muted">No articles match the selected tag.</p>
        </div>
      ) : (
        <ul className="post-list">
          {visiblePosts.map((post) => (
            <li key={post.id} className="post-row">
              <time dateTime={post.created_at ?? undefined} className="post-row__date">
                {formatDate(post.created_at)}
              </time>
              <div className="min-w-0">
                <h2 className="post-row__title">
                  <Link href={`/posts/${post.id}`}>{post.title}</Link>
                </h2>
                <p className="post-row__excerpt">{post.excerpt}</p>
                {post.tags.length > 0 && (
                  <div className="chip-row chip-row--tight">
                    {post.tags.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => selectTag(name)}
                        className="chip chip-sm"
                        aria-pressed={activeTag === name}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="pager">
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="icon-btn"
          >
            <ArrowLeftIcon />
          </button>
          <span aria-live="polite" className="pager__status">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="icon-btn"
          >
            <ArrowRightIcon />
          </button>
        </nav>
      )}
    </>
  );
}
