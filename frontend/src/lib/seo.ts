import type { Metadata } from "next";
import { OG_IMAGE, SITE_NAME } from "./site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
};

function openGraphFor(input: PageMetadataInput, fullTitle: string): Metadata["openGraph"] {
  const base = {
    locale: "en_US",
    siteName: SITE_NAME,
    url: input.path,
    title: fullTitle,
    description: input.description,
    images: [OG_IMAGE],
  };

  if (input.type === "article") {
    return {
      ...base,
      type: "article",
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
      authors: [SITE_NAME],
      tags: input.tags,
    };
  }

  if (input.type === "profile") {
    return {
      ...base,
      type: "profile",
      firstName: "Catalin-Marian",
      lastName: "Milchis",
      username: "DarkSoulEngineer",
    };
  }

  return { ...base, type: "website" };
}

export function pageMetadata(input: PageMetadataInput): Metadata {
  const fullTitle = `${input.title} | ${SITE_NAME}`;

  const metadata: Metadata = {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: openGraphFor(input, fullTitle),
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
      images: [OG_IMAGE.url],
    },
  };

  if (input.noindex) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}
