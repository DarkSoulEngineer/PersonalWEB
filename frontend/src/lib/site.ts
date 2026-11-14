import { getProfile } from "./profile";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

const profile = getProfile();

export const SITE_NAME = profile.name;
export const SITE_TITLE = `${profile.name} | Penetration Tester, Cybersecurity & Telecom`;
export const SITE_DESCRIPTION =
  "Milchis Catalin-Marian (DarkSoulEngineer) is a penetration tester working across cybersecurity and telecom, from Brasov, Romania: web and API pentesting at Arvato Systems, telecom R&D at Mitel Networks, CTF player for UNITBV. Projects and CV.";

export const SITE_KEYWORDS = [
  "Milchis Catalin-Marian",
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
  alt: `${profile.name}, penetration tester, cybersecurity and telecom`,
};

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
