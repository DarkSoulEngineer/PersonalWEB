"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBox from "@/components/ui/SearchBox";
import { formatDate } from "@/lib/format";
import { matchesQuery } from "@/lib/search";
import type { PostListItem, Tag } from "@/lib/types";

const PAGE_SIZE = 5;

function PostRow({
  post,
  onTagClick,
}: {
  post: PostListItem;
  onTagClick: (name: string) => void;
}) {
  return (
    <li className="row">
      <time className="row__meta" dateTime={post.created_at ?? undefined}>
        {formatDate(post.created_at)}
      </time>
      <div>
        <h2 className="row__title">
          <Link href={`/posts/${post.id}`}>{post.title}</Link>
        </h2>
        {post.excerpt ? <p className="row__desc">{post.excerpt}</p> : null}
        {post.tags.length > 0 && (
          <div className="row__tags">
            {post.tags.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onTagClick(name)}
                className="chip chip-sm"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export default function ArticlesView({
  posts,
  tags,
}: {
  posts: PostListItem[];
  tags: Tag[];
}) {
  const [activeTag, setActiveTag] = useState("");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  // Honour /articles?tag=... links (post pages link here) and back/forward.
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

  const filtered = posts.filter(
    (post) =>
      (!activeTag || post.tags.includes(activeTag)) &&
      matchesQuery(query, [post.title, post.excerpt, ...post.tags]),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visiblePosts = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function handleQuery(value: string) {
    setPage(1);
    setQuery(value);
  }

  function clearFilters() {
    setPage(1);
    setQuery("");
    setActiveTag("");
  }

  // Nothing published: no search or filters, just say so.
  if (posts.length === 0) {
    return (
      <>
        <header className="page-head">
          <h1 className="page-title">Articles</h1>
        </header>
        <div className="empty-state">
          <p className="empty-state__title">No articles yet</p>
          <p className="empty-state__text">
            The first articles are being written. In the meantime, the projects
            page shows what I have been building.
          </p>
          <Link href="/projects" className="btn">
            See projects
          </Link>
        </div>
      </>
    );
  }

  function handleTagClick(name: string) {
    setPage(1);
    setActiveTag(name === activeTag ? "" : name);
  }

  return (
    <>
      <header className="page-head">
        <h1 className="page-title">Articles</h1>
        <p className="page-lead">
          Notes on wireless security, hardware teardowns and the tools I build
          along the way.
        </p>
      </header>

      <div className="list-tools">
        <SearchBox
          value={query}
          onChange={handleQuery}
          label="Search articles"
          placeholder="Search articles"
        />
      </div>

      {tags.length > 0 && (
        <div className="chip-row" role="group" aria-label="Filter by tag">
          <button
            type="button"
            onClick={() => handleTagClick("")}
            aria-pressed={activeTag === ""}
            className="chip"
          >
            All <span className="chip-count">{posts.length}</span>
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagClick(tag.name)}
              aria-pressed={activeTag === tag.name}
              className="chip"
            >
              {tag.name} <span className="chip-count">{tag.posts_count}</span>
            </button>
          ))}
        </div>
      )}

      {visiblePosts.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No articles found</p>
          <p className="empty-state__text">
            {query
              ? `Nothing matches “${query.trim()}”${activeTag ? ` under ${activeTag}` : ""}. Try another word or clear the search.`
              : "No articles with this tag yet."}
          </p>
          <button type="button" className="btn" onClick={clearFilters}>
            Show all articles
          </button>
        </div>
      ) : (
        <>
          <ol className="rows">
            {visiblePosts.map((post) => (
              <PostRow key={post.id} post={post} onTagClick={handleTagClick} />
            ))}
          </ol>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="pager">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="btn btn-sm"
              >
                <span aria-hidden>←</span> Newer
              </button>
              <span aria-live="polite" className="pager-status">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="btn btn-sm"
              >
                Older <span aria-hidden>→</span>
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
