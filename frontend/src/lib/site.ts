function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(explicit || "https://milchiscatalin.com");
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password
    || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without credentials, path, query or fragment.");
  }
  return url.origin;
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "";
export const SITE_TITLE = `Penetration Tester in Brașov, Romania`;
export const HOME_HEADING = "Penetration Tester & Security Engineer in Brașov, Romania";
export const SITE_DESCRIPTION =
  "Milchiș Cătălin-Marian, Penetration Tester & Security Engineer in Brașov, Romania. Web and API security assessments, telecom R&D and open-source security projects.";

export const SITE_KEYWORDS = [
  "Milchis Catalin-Marian",
  SITE_NAME,
  "Catalin Milchis",
  "Milchis Catalin",
  "Cătălin-Marian Milchis",
  "DarkSoulEngineer",
  "penetration tester",
  "pentester Romania",
  "pentester Brasov",
  "ethical hacker",
  "telecom",
  "telecommunications engineering",
  "telecommunications student",
  "vulnerability assessment",
  "Mitel Networks Romania",
  "web application security",
  "API security",
  "CTF UNITBV",
  "Google.org Cybersecurity Seminars",
  "Brasov Cybersecurity Community",
  "Arvato Systems Romania",
  "Transilvania University of Brasov",
  "cybersecurity Brasov",
  "Brașov",
  "CV",
  "portfolio",
];

export const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}, penetration tester in Brașov, Romania`,
};

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
