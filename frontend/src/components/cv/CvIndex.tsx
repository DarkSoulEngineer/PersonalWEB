"use client";

export const CV_SECTIONS = [
  { id: "summary", label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "achievements", label: "Training" },
] as const;

export type CvSectionId = (typeof CV_SECTIONS)[number]["id"];

export function CvIndex({
  activeId,
  onNavigate,
}: {
  activeId: CvSectionId;
  onNavigate: (id: CvSectionId) => void;
}) {

  return (
    <nav className="cv-index" aria-label="CV sections">
      <ul className="nav">
        {CV_SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="nav-link"
              aria-current={activeId === section.id ? "true" : undefined}
              onClick={(event) => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                onNavigate(section.id);
              }}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
