import CvPrint from "@/components/cv/CvPrint";
import PrintButton from "@/components/cv/PrintButton";
import { CvIndex } from "@/components/cv/CvIndex";
import { formatDateOnly } from "@/lib/format";
import type { Cv } from "@/lib/types";

function SectionHead({ title, meta }: { title: string; meta?: string }) {
  return (
    <header className="cv-section-head">
      <h2 className="cv-section-title">{title}</h2>
      {meta ? <span className="label">{meta}</span> : null}
    </header>
  );
}

function CvRail({ cv }: { cv: Cv }) {
  const { profile } = cv;
  const [firstName, ...restName] = profile.name.split(" ");
  const [handle, ...altHandles] = profile.aliases;

  return (
    <aside className="cv-rail" aria-label="Profile and contact">
      <div className="cv-rail-inner">
        <div className="cv-head">
          <div className="cv-ident">
            <h1 className="cv-name">
              {restName.join(" ")} <span className="cv-name-rest">{firstName}</span>
            </h1>
            <p className="cv-handles">
              @{handle}
              {altHandles.length > 0
                ? `, also ${altHandles.map((h) => `@${h}`).join(", ")}`
                : null}
            </p>
            <p className="cv-headline">{profile.headline.replace(/\s*\n\s*/g, " ")}</p>
            <p className="cv-location">{profile.location}</p>
          </div>

          <figure className="cv-portrait">
            <img
              src={cv.photo ?? profile.photo}
              alt={`Portrait of ${profile.name}`}
              width={240}
              height={240}
            />
          </figure>
        </div>

        <nav className="cv-contact" aria-label="Contact">
          <ul className="cv-kv">
            <li className="cv-kv-row">
              <span className="cv-kv-key">Email</span>
              <a
                href={`mailto:${cv.contact.email}`}
                className="cv-kv-val link"
              >
                {cv.contact.email}
              </a>
            </li>
            <li className="cv-kv-row">
              <span className="cv-kv-key">LinkedIn</span>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="cv-kv-val link"
              >
                Profile
              </a>
            </li>
            <li className="cv-kv-row">
              <span className="cv-kv-key">GitHub</span>
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="cv-kv-val link"
              >
                Repositories
              </a>
            </li>
          </ul>
        </nav>

        <div className="cv-skills">
          <p className="label">Skills</p>
          {cv.skillGroups.map((group) => (
            <div key={group.group} className="cv-skill-group">
              <p className="cv-skill-key">{group.group}</p>
              <ul className="cv-skill-list">
                {group.items.map((item) => (
                  <li key={item} className="cv-skill">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function CvView({ cv }: { cv: Cv }) {
  const { profile } = cv;
  const { education } = profile;

  return (
    <div className="cv-root">
      {/* Printing swaps the whole screen layout for the compact sheet. */}
      <CvPrint cv={cv} />

      <div className="cv-screen">
      <div className="cv-docbar">
        <CvIndex />
        <PrintButton />
      </div>

      <div className="cv-page">
        <div className="cv-shell">
          <CvRail cv={cv} />

          <div className="cv-main">
            {/* Summary */}
            <section
              id="summary"
              className="cv-section cv-summary"
              aria-labelledby="cv-summary-title"
            >
              <h2 id="cv-summary-title" className="label">
                Profile
              </h2>
              <p className="cv-summary-text">{cv.summary}</p>
            </section>

            {/* Experience */}
            <section
              id="experience"
              className="cv-section"
              aria-label="Experience"
            >
              <SectionHead title="Experience" />
              <ol className="cv-rules">
                {cv.experience.map((job) => (
                  <li key={`${job.organization}-${job.role}`} className="cv-rule">
                    <div className="cv-rule-meta">
                      {/* "Present" already says it is current; the accent dot marks it */}
                      <span className={`cv-rule-period${job.current ? " cv-flag" : ""}`}>
                        {job.period}
                      </span>
                    </div>
                    <div className="cv-rule-main">
                      <h3 className="cv-row-title">{job.role}</h3>
                      <p className="cv-row-org">{job.organization}</p>
                      <ul className="cv-points">
                        {job.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section id="education" className="cv-section" aria-label="Education">
              <SectionHead title="Education" />
              <div className="cv-edu">
                <h3 className="cv-edu-school">
                  {education.school}
                </h3>
                <dl className="cv-kv cv-kv-block">
                  <div className="cv-kv-row">
                    <dt className="cv-kv-key">Faculty</dt>
                    <dd className="cv-kv-val">{education.faculty}</dd>
                  </div>
                  <div className="cv-kv-row">
                    <dt className="cv-kv-key">Domain</dt>
                    <dd className="cv-kv-val">{education.domain}</dd>
                  </div>
                  <div className="cv-kv-row">
                    <dt className="cv-kv-key">Extracurricular</dt>
                    <dd className="cv-kv-val">
                      <ul className="cv-extras">
                        {education.extracurriculars.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section
              id="achievements"
              className="cv-section"
              aria-label="Achievements"
            >
              <SectionHead title="Achievements" />
              <ol className="cv-rules">
                {cv.achievements.map((item) => (
                  <li key={item.id} className="cv-rule">
                    <div className="cv-rule-meta">
                      <time
                        className="cv-rule-period"
                        dateTime={item.date ?? undefined}
                      >
                        {formatDateOnly(item.date)}
                      </time>
                      <span className="cv-rule-note">{item.category}</span>
                    </div>
                    <div className="cv-rule-main">
                      <h3 className="cv-row-title">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link"
                          >
                            {item.title}
                          </a>
                        ) : (
                          item.title
                        )}
                      </h3>
                      <p className="cv-row-desc">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
