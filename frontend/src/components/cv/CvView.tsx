import CvToolbar from "@/components/cv/CvToolbar";
import { ExternalIcon, GitHubIcon, LinkedInIcon, MailIcon, PinIcon } from "@/components/ui/icons";
import { languageColor } from "@/lib/projects";
import type { Cv } from "@/lib/types";

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
}

function formatMonth(iso: string | null): string {
  if (!iso) return "";
  const [y, m] = iso.split("-").map(Number);
  if (!y || !m) return iso;
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export default function CvView({ cv }: { cv: Cv }) {
  const { profile } = cv;
  const { education } = profile;

  return (
    <div className="cv">
      <CvToolbar />

      <article className="cv-sheet">
        <header className="cv-header">
          <h1 className="cv-name">{profile.name}</h1>
          <p className="cv-title">{cv.title ?? profile.headline}</p>
          <ul className="cv-contact">
            <li>
              <PinIcon className="cv-icon" />
              {profile.location}
            </li>
            <li>
              <MailIcon className="cv-icon" />
              <a href={`mailto:${cv.contact.email}`}>{cv.contact.email}</a>
            </li>
            <li>
              <LinkedInIcon className="cv-icon" />
              <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer me">
                {displayUrl(profile.links.linkedin)}
              </a>
            </li>
            <li>
              <GitHubIcon className="cv-icon" />
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer me">
                {displayUrl(profile.links.github)}
              </a>
            </li>
          </ul>
        </header>

        <div className="cv-body">
          <section id="summary" className="cv-section" aria-labelledby="cv-summary">
            <h2 id="cv-summary" className="cv-heading">
              Profile
            </h2>
            <p className="cv-text">{cv.summary}</p>
          </section>

          <section id="experience" className="cv-section" aria-labelledby="cv-experience">
            <h2 id="cv-experience" className="cv-heading">
              Experience
            </h2>
            <ol className="cv-entries">
              {cv.experience.map((job) => (
                <li
                  key={`${job.organization}-${job.role}-${job.period}`}
                  className={job.current ? "cv-entry" : "cv-entry cv-entry--past"}
                >
                  <div className="cv-entry__head">
                    <h3 className="cv-entry__title">
                      {job.role}
                      <span className="cv-entry__org">
                        <span className="cv-sep">, </span>
                        {job.organization}
                      </span>
                    </h3>
                    <span className="cv-entry__date">{job.period}</span>
                  </div>
                  <ul className="cv-points">
                    {job.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          <section id="skills" className="cv-section cv-section--skills" aria-labelledby="cv-skills">
            <h2 id="cv-skills" className="cv-heading">
              Skills
            </h2>
            <dl className="cv-skills">
              {cv.skillGroups.map((group) => (
                <div key={group.group} className="cv-skills__row">
                  <dt>{group.group}</dt>
                  <dd>
                    <ul className="cv-skills__list">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="work" className="cv-section cv-section--projects" aria-labelledby="cv-work">
            <h2 id="cv-work" className="cv-heading">
              Projects
            </h2>
            <ol className="cv-entries">
              {cv.featuredProjects.map((project) => (
                <li key={project.id} className="cv-entry cv-project">
                  <span className="cv-project__head">
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="cv-project__name">
                      {project.name}
                      <ExternalIcon className="inline-link-icon" />
                    </a>
                    <span className="cv-project__lang">
                      <span
                        className="lang-dot"
                        style={{ backgroundColor: languageColor(project.language) }}
                        aria-hidden
                      />
                      {project.language}
                    </span>
                  </span>
                  <span className="cv-project__desc">{project.description}</span>
                </li>
              ))}
            </ol>
          </section>

          <section id="education" className="cv-section" aria-labelledby="cv-education">
            <h2 id="cv-education" className="cv-heading">
              Education
            </h2>
            <div className="cv-entry">
              <div className="cv-entry__head">
                <h3 className="cv-entry__title">
                  {education.domain}
                  <span className="cv-entry__org">
                    <span className="cv-sep">, </span>
                    {education.school}
                  </span>
                </h3>
                <span className="cv-entry__date">Present</span>
              </div>
              <ul className="cv-points">
                {education.extracurriculars.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {cv.interests.length > 0 ? (
            <section className="cv-section" aria-labelledby="cv-interests">
              <h2 id="cv-interests" className="cv-heading">
                Interests
              </h2>
              <p className="cv-text">{cv.interests.join(", ")}.</p>
            </section>
          ) : null}

          <section
            id="achievements"
            className="cv-section cv-section--compact"
            aria-labelledby="cv-achievements"
          >
            <h2 id="cv-achievements" className="cv-heading">
              Training & achievements
            </h2>
            <ol className="cv-entries">
              {cv.achievements.map((item) => (
                <li key={item.id} className="cv-entry">
                  <div className="cv-entry__head">
                    <h3 className="cv-entry__title cv-entry__title--plain">
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.title}
                          <ExternalIcon className="inline-link-icon" />
                        </a>
                      ) : (
                        item.title
                      )}
                    </h3>
                    {item.date ? (
                      <time className="cv-entry__date" dateTime={item.date}>
                        {formatMonth(item.date)}
                      </time>
                    ) : null}
                  </div>
                  <p className="cv-entry__text">{item.description}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </article>
      <div className="cv-anchor-space" aria-hidden="true" />
    </div>
  );
}
