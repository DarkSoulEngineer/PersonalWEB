import { getCv } from "./cv";
import { PERSON_ID, SITE_DESCRIPTION, SITE_NAME, SITE_URL, WEBSITE_ID, absoluteUrl } from "./site";
import type { PostDetail, Project, ProjectCaseStudy } from "./types";
import { projectDetailPath } from "./project-routes";

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
    name: SITE_NAME,
    alternateName: [...new Set([profile.name, ...profile.aliases, "Catalin Milchis", "Milchis Catalin", "Cătălin-Marian Milchis"])],
    givenName: "Cătălin-Marian",
    familyName: "Milchiș",
    url: SITE_URL,
    image: absoluteUrl(cv.photo ?? profile.photo),
    jobTitle: [profile.jobTitle, "Security Engineer"],
    description: profile.bio,
    hasOccupation: {
      "@type": "Occupation",
      name: profile.jobTitle,
      occupationalCategory: "15-1212.00",
      occupationLocation: { "@type": "City", name: "Brașov", containedInPlace: { "@type": "Country", name: "Romania" } },
      skills: skills.join(", "),
    },
    nationality: { "@type": "Country", name: "Romania" },
    email: `mailto:${cv.contact.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brașov",
      addressCountry: "RO",
    },
    worksFor: profile.worksFor.map((name) => ({ "@type": "Organization", name })),
    memberOf: profile.memberOf.map((name) => ({ "@type": "Organization", name })),
    affiliation: { "@type": "CollegeOrUniversity", name: profile.education.school },
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
    name: `Open-source projects by ${SITE_NAME}`,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareSourceCode",
        url: projectDetailPath(project.id) ? absoluteUrl(projectDetailPath(project.id)!) : project.url,
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

export function projectCaseStudySchema(project: Project, study: ProjectCaseStudy): Schema {
  const url = absoluteUrl(`/projects/${study.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        url,
        headline: study.title,
        description: study.description,
        mainEntityOfPage: url,
        dateModified: study.reviewedAt,
        author: { "@id": PERSON_ID },
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": `${url}#code` },
        citation: study.sources.map((source) => source.url),
        inLanguage: "en",
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#code`,
        url,
        name: project.name,
        description: study.description,
        codeRepository: project.url,
        programmingLanguage: project.language,
        author: { "@id": PERSON_ID },
        license: study.license,
      },
    ],
  };
}
