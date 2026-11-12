import { formatMonthYear } from "@/lib/format";
import type { Cv } from "@/lib/types";

/** "https://www.linkedin.com/in/x/" -> "linkedin.com/in/x" */
function shortUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/**
 * The printed CV: one compact A4 sheet, hidden on screen and shown only when
 * printing or saving as PDF. It reads the same data as the rest of the site;
 * `cv.print` (see lib/cv.ts) decides which projects and achievements fit.
 */
export default function CvPrint({ cv }: { cv: Cv }) {
  const { profile, print } = cv;
  const [lastName, ...firstNames] = profile.name.split(" ");
  const { education } = profile;
  // Spoken languages go in the header; the Skills block keeps technical skills.
  const isSpoken = (group: string) => group.toLowerCase() === "languages";
  const spoken = cv.skillGroups.find((group) => isSpoken(group.group));
  const technical = cv.skillGroups.filter((group) => !isSpoken(group.group));

  return (
    <div className="cv-print">
      <header className="cvp-head">
        <div>
          <h1 className="cvp-name">
            {firstNames.join(" ")} {lastName}
          </h1>
          <p className="cvp-headline">
            {profile.headline.replace(/\s*\n\s*/g, " ")}
          </p>
        </div>
        <ul className="cvp-contact">
          <li>{profile.location}</li>
          {spoken ? <li>{spoken.items.join(", ")}</li> : null}
          <li>
            <a href={`mailto:${cv.contact.email}`}>{cv.contact.email}</a>
          </li>
          <li>
            <a href={profile.links.linkedin}>{shortUrl(profile.links.linkedin)}</a>
          </li>
          <li>
            <a href={profile.links.github}>{shortUrl(profile.links.github)}</a>
          </li>
        </ul>
      </header>

      <section className="cvp-section">
        <h2>Profile</h2>
        <p>{cv.summary}</p>
      </section>

      <section className="cvp-section">
        <h2>Experience</h2>
        <div>
          {cv.experience.map((job, index) => (
            <div key={`${job.organization}-${job.role}`} className="cvp-entry">
              <p className="cvp-entry-head">
                <span>
                  <strong>{job.role}</strong>, {job.organization}
                </span>
                <span className="cvp-period">{job.period}</span>
              </p>
              {index < print.detailedRoles && job.points.length > 0 ? (
                <ul className="cvp-points">
                  {job.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {print.projects.length > 0 && (
        <section className="cvp-section">
          <h2>Projects</h2>
          <div>
            {print.projects.map((project) => (
              <div key={project.id} className="cvp-entry">
                <p className="cvp-entry-head">
                  <strong>
                    <a href={project.url}>{project.name}</a>
                  </strong>
                  <span className="cvp-period">
                    {(project.stack?.length ? project.stack : [project.language]).join(", ")}
                  </span>
                </p>
                <p>{project.description}</p>
              </div>
            ))}
            <p className="cvp-more cvp-dim">
              More projects at {shortUrl(profile.links.github)}
            </p>
          </div>
        </section>
      )}

      <section className="cvp-section">
        <h2>Education</h2>
        <div>
          <p className="cvp-line">
            <strong>{education.school}</strong>, {education.faculty}
          </p>
          {education.extracurriculars.map((item) => (
            <p key={item} className="cvp-line">
              {item}
            </p>
          ))}
        </div>
      </section>

      {print.achievements.length > 0 && (
        <section className="cvp-section">
          <h2>Training and events</h2>
          <div>
            {print.achievements.map((item) => (
              <p key={item.id} className="cvp-dated">
                <span className="cvp-dim">{formatMonthYear(item.date)}</span>
                <span>{item.title}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      <section className="cvp-section">
        <h2>Skills</h2>
        <div>
          {technical.map((group) => (
            <p key={group.group} className="cvp-line">
              <strong>{group.group}:</strong> {group.items.join(", ")}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
