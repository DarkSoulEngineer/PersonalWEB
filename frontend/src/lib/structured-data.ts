import { getCv } from "./cv";
import { PERSON_ID, SITE_DESCRIPTION, SITE_NAME, SITE_URL, WEBSITE_ID, absoluteUrl } from "./site";
import type { PostDetail, Project } from "./types";

type Schema = Record<string, unknown>;

export function personSchema(): Schema {
  const cv = getCv();
  const { profile } = cv;
  const skills = cv.skillGroups
    .filter((group) => group.group !== "Languages")
    .flatMap((group) => group.items);

  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    alternateName: [...profile.aliases, "Catalin Milchis", "Milchis Catalin", "Cătălin-Marian Milchis"],
    givenName: "Catalin-Marian",
    familyName: "Milchis",
    url: SITE_URL,
    image: absoluteUrl(cv.photo ?? profile.photo),
    jobTitle: profile.jobTitle,
    description: profile.bio,
    hasOccupation: {
      "@type": "Occupation",
      name: profile.jobTitle,
      occupationalCategory: "15-1212.00",
      occupationLocation: { "@type": "City", name: "Brasov, Romania" },
      skills: skills.join(", "),
    },
    nationality: { "@type": "Country", name: "Romania" },
    award: cv.achievements.map((item) => item.title),
    email: `mailto:${cv.contact.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.location.split(",")[0]?.trim(),
      addressCountry: "RO",
    },
    worksFor: profile.worksFor.map((name) => ({ "@type": "Organization", name })),
    memberOf: profile.memberOf.map((name) => ({ "@type": "Organization", name })),
    alumniOf: { "@type": "CollegeOrUniversity", name: profile.education.school },
    knowsAbout: [...new Set([...profile.skills, ...skills])],
    knowsLanguage: ["ro", "en"],
    sameAs: [profile.links.linkedin, profile.links.github],
  };
}

export function websiteSchema(): Schema {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };
}

export function siteGraph(): Schema {
  return {
    "@context": "https://schema.org",
    "@graph": [websiteSchema(), personSchema()],
  };
}

export function profilePageSchema(path: string, name: string, description: string): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
    inLanguage: "en",
  };
}

export function collectionPageSchema(path: string, name: string, description: string): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": PERSON_ID },
    inLanguage: "en",
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPostingSchema(post: PostDetail): Schema {
  const url = absoluteUrl(`/posts/${post.id}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.created_at ?? undefined,
    dateModified: post.updated_at ?? post.created_at ?? undefined,
    keywords: post.tags.join(", "),
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en",
  };
}

export function projectListSchema(projects: Project[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Open-source projects by Milchis Catalin-Marian",
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareSourceCode",
        name: project.name,
        description: project.description,
        codeRepository: project.url,
        programmingLanguage: project.language,
        dateModified: project.github_updated_at ?? undefined,
        author: { "@id": PERSON_ID },
      },
    })),
  };
}
