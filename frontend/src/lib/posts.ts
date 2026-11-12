import fs from "node:fs";
import path from "node:path";

import type { PostDetail, PostListItem, Stats, Tag } from "./types";


interface Frontmatter {
  title?: string;
  author?: string;
  date?: string;
  updated?: string;
  tags?: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return { data: {}, body: raw.trim() };

  const data: Frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim() as keyof Frontmatter;
    data[key] = line.slice(separator + 1).trim();
  }
  return { data, body: match[2].trim() };
}

function parseTags(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function makeExcerpt(body: string, maxLength = 200): string {
  const paragraph =
    body
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find((block) => block && !/^(#{1,6}\s|```|>\s|\||!?\[)/.test(block)) ??
    "";

  const plain = paragraph
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[*_~#>|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > maxLength ? `${plain.slice(0, maxLength).trimEnd()}…` : plain;
}


interface RawPost {
  slug: string;
  title: string;
  author: string;
  date: string;
  updated: string | null;
  tags: string[];
  body: string;
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

/**
 * Fallback slug rendered when the archive is empty.
 *
 * With `output: "export"` a dynamic route must pre-render at least one path, so
 * an empty `content/posts/` would otherwise fail the whole production build.
 * The posts page shows an "archive empty" state for this slug instead.
 */
export const EMPTY_POST_SLUG = "no-posts";

export function hasPosts(): boolean {
  return posts().length > 0;
}

function readPosts(): RawPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();

  return files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const { data, body } = parseFrontmatter(
      fs.readFileSync(path.join(POSTS_DIR, file), "utf8"),
    );

    const updated = data.updated && data.updated !== data.date ? data.updated : null;

    return {
      slug,
      title: data.title ?? slug,
      author: data.author ?? "",
      date: data.date ?? "",
      updated,
      tags: parseTags(data.tags),
      body,
    };
  });
}

let cachedPosts: RawPost[] | null = null;

function posts(): RawPost[] {
  if (!cachedPosts) cachedPosts = readPosts();
  return cachedPosts;
}

export function getPostSlugs(): string[] {
  return posts().map((post) => post.slug);
}

export function getPostList(): PostListItem[] {
  return posts()
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)))
    .map((post) => ({
      id: post.slug,
      title: post.title,
      author: post.author,
      tags: post.tags,
      created_at: post.date || null,
      updated_at: post.updated,
      excerpt: makeExcerpt(post.body),
    }));
}

export function getPost(slug: string): PostDetail | null {
  const post = posts().find((candidate) => candidate.slug === slug);
  if (!post) return null;

  return {
    id: post.slug,
    title: post.title,
    content: post.body,
    author: post.author,
    tags: post.tags,
    created_at: post.date || null,
    updated_at: post.updated,
  };
}

export function getTags(): Tag[] {
  if (!hasPosts()) return [];

  const counts = new Map<string, number>();
  for (const post of posts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, posts_count]) => ({ id: name, name, posts_count }));
}

export function getStats(): Stats {
  const list = getPostList();
  return {
    posts: list.length,
    tags: getTags().length,
  };
}
