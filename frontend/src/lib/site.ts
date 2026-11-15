function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(explicit || "https://milchiscatalin.com");
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password
    || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without credentials, path, query or fragment.");
  }
  if (["milchiscatalin.com", "www.milchiscatalin.com"].includes(url.hostname)) return "https://milchiscatalin.com";
  return url.origin;
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Cătălin Milchiș";
export const SITE_TITLE = `Penetration Tester & Security Engineer | ${SITE_NAME}`;
export const HOME_HEADING = "Penetration Tester & Security Engineer";
export const SITE_DESCRIPTION =
  "Cătălin Milchiș is a penetration tester and security engineer in Brașov, Romania, with experience in application security, telecom R&D and embedded systems research.";

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
