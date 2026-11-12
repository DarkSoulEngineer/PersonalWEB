import type { CSSProperties } from "react";
import Link from "next/link";
import RadioButton from "@/components/radio/RadioButton";
import { formatDate } from "@/lib/format";
import { languageColor } from "@/lib/languages";
import type {
  CvExperience,
  Milestone,
  PostListItem,
  Profile,
  Project,
} from "@/lib/types";

function delay(ms: number): CSSProperties {
  return { "--delay": `${ms}ms` } as CSSProperties;
}

function Hero({
  profile,
}: {
  profile: Profile;
  currentRole: CvExperience | null;
}) {
  const [lastName, ...firstNames] = profile.name.split(" ");
  const headline = profile.headline.replace(/\s*\n\s*/g, " ");

  return (
    <section className="hero" aria-label="Introduction">
      <div>
        <h1 className="hero-name rise" style={delay(0)}>
          {firstNames.join(" ")}
          <span>{lastName}</span>
        </h1>

        <p className="hero-headline rise" style={delay(140)}>
          {headline}.
        </p>
        <p className="hero-bio rise" style={delay(200)}>
          {profile.bio}
        </p>

        <div className="hero-actions rise" style={delay(260)}>
          <Link href="/cv" className="btn btn-primary">
            Read my CV
          </Link>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            GitHub
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <aside className="hero-aside rise" style={delay(320)}>
        <figure className="portrait">
          <img
            src={profile.photo}
            alt={`${profile.github.login} logo`}
            width={272}
            height={272}
          />
        </figure>
        <dl className="facts">
          <div className="facts-row">
            <dt>Based in</dt>
            <dd>{profile.location}</dd>
          </div>
          <div className="facts-row">
            <dt>Handle</dt>
            <dd>{profile.github.login}</dd>
          </div>
          <div className="facts-row">
            <dt>Focus</dt>
            <dd>Cybersecurity</dd>
          </div>
        </dl>
        <RadioButton />
      </aside>
    </section>
  );
}

function SelectedWork({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="section" aria-labelledby="work-title">
      <div className="section-head">
        <h2 id="work-title" className="section-title">
          Selected work
        </h2>
        <Link href="/projects" className="arrow-link">
          All projects <span aria-hidden>→</span>
        </Link>
      </div>

      <ul className="rows">
        {projects.map((project) => (
          <li key={project.id} className="row row--link">
            <div className="row__meta">
              <span className="row__lang">
                <span
                  className="lang-dot"
                  aria-hidden
                  style={{ backgroundColor: languageColor(project.language) }}
                />
                {project.language}
              </span>
              <span>{project.category}</span>
            </div>
            <div>
              <h3 className="row__title">
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  {project.name}
                </a>
              </h3>
              <p className="row__desc">{project.description}</p>
              {project.stack?.length ? (
                <p className="row__stack">{project.stack.join(" / ")}</p>
              ) : null}
            </div>
            <span className="row__arrow" aria-hidden>
              ↗
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LatestArticles({ posts }: { posts: PostListItem[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="section" aria-labelledby="articles-title">
      <div className="section-head">
        <h2 id="articles-title" className="section-title">
          Latest articles
        </h2>
        <Link href="/articles" className="arrow-link">
          All articles <span aria-hidden>→</span>
        </Link>
      </div>

      <ol className="rows">
        {posts.map((post) => (
          <li key={post.id} className="row">
            <time className="row__meta" dateTime={post.created_at ?? undefined}>
              {formatDate(post.created_at)}
            </time>
            <div>
              <h3 className="row__title">
                <Link href={`/posts/${post.id}`}>{post.title}</Link>
              </h3>
              {post.excerpt ? <p className="row__desc">{post.excerpt}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Highlights({ items }: { items: Milestone[] }) {
  if (items.length === 0) return null;

  return (
    <section className="section" aria-labelledby="highlights-title">
      <div className="section-head">
        <h2 id="highlights-title" className="section-title">
          Training and events
        </h2>
        <Link href="/cv#achievements" className="arrow-link">
          Full list <span aria-hidden>→</span>
        </Link>
      </div>

      <ol className="rows">
        {items.map((item) => (
          <li key={item.id} className={item.url ? "row row--link" : "row"}>
            <div className="row__meta">
              <time dateTime={item.date ?? undefined}>{formatDate(item.date)}</time>
              <span>{item.category}</span>
            </div>
            <div>
              <h3 className="row__title">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </h3>
              <p className="row__desc">{item.description}</p>
            </div>
            {item.url ? (
              <span className="row__arrow" aria-hidden>
                ↗
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function HomeView({
  profile,
  email,
  currentRole,
  projects,
  posts,
  highlights,
}: {
  profile: Profile;
  email: string;
  currentRole: CvExperience | null;
  projects: Project[];
  posts: PostListItem[];
  highlights: Milestone[];
}) {
  return (
    <>
      <Hero profile={profile} currentRole={currentRole} />
      <SelectedWork projects={projects} />
      <LatestArticles posts={posts} />
      <Highlights items={highlights} />

      <section className="contact-band" aria-label="Contact">
        <div>
          <h2 className="contact-band__title">Get in touch</h2>
          <p className="contact-band__text">
            Email is the fastest way to reach me.
          </p>
        </div>
        <a href={`mailto:${email}`} className="btn btn-primary">
          {email}
        </a>
      </section>
    </>
  );
}
