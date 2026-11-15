import type { MetadataRoute } from "next";
import { getPostList } from "@/lib/posts";
import { getProjects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";
import { PROJECT_CASE_STUDIES } from "@/lib/project-case-studies";

export const dynamic = "force-static";

function latest(dates: (string | null | undefined)[]): string | undefined {
  const valid = dates.filter((d): d is string => Boolean(d)).sort();
  return valid.length ? valid[valid.length - 1] : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPostList();
  const projectsUpdated = latest([
    ...getProjects().map((p) => p.github_updated_at),
    ...PROJECT_CASE_STUDIES.map((study) => study.reviewedAt),
  ]);
  const postsUpdated = latest(posts.map((p) => p.updated_at ?? p.created_at));

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/cv"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/services"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/projects"), lastModified: projectsUpdated, changeFrequency: "monthly", priority: 0.8 },
  ];
  for (const study of PROJECT_CASE_STUDIES) {
    pages.push({
      url: absoluteUrl(`/projects/${study.slug}`),
      lastModified: study.reviewedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  if (posts.length > 0) {
    pages.push({ url: absoluteUrl("/articles"), lastModified: postsUpdated, changeFrequency: "weekly", priority: 0.7 });
    for (const post of posts) {
      pages.push({
        url: absoluteUrl(`/posts/${post.id}`),
        lastModified: post.updated_at ?? post.created_at ?? undefined,
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }
  }

  return pages;
}
