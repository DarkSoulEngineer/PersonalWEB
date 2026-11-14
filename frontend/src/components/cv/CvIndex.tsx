"use client";

import { useEffect, useState } from "react";

export const CV_SECTIONS = [
  { id: "summary", label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "achievements", label: "Training" },
] as const;

export function CvIndex() {
  const [activeId, setActiveId] = useState<string>(CV_SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    for (const section of CV_SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="cv-index" aria-label="CV sections">
      <ul className="nav">
        {CV_SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="nav-link"
              aria-current={activeId === section.id ? "true" : undefined}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
