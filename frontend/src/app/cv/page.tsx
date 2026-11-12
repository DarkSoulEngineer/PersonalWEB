import type { Metadata } from "next";
import CvView from "@/components/cv/CvView";
import { getCv } from "@/lib/cv";

export const metadata: Metadata = {
  title: "CV",
  description:
    "Curriculum vitae of Catalin-Marian Milchis: penetration testing, cybersecurity and software engineering.",
  openGraph: {
    title: "CV · Milchis Catalin-Marian",
    description:
      "Experience, education, skills and achievements of Catalin-Marian Milchis: penetration tester and software engineer.",
    type: "profile",
  },
};

export default function CvPage() {
  const cv = getCv();
  const { profile } = cv;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.aliases,
    jobTitle: profile.headline.replace(/\s+/g, " ").trim(),
    email: `mailto:${cv.contact.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.location.split(",")[0]?.trim(),
      addressCountry: "RO",
    },
    sameAs: [profile.links.linkedin, profile.links.github],
    knowsAbout: profile.skills,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: profile.education.school,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <CvView cv={cv} />
    </>
  );
}
