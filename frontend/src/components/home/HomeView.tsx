import Link from "next/link";
import ProjectCard from "@/components/projects/ProjectCard";
import { ArrowRightIcon, ExternalIcon, GitHubIcon, LinkedInIcon, PinIcon } from "@/components/ui/icons";
import SectionHeader from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/format";
import type { Cv, PostListItem } from "@/lib/types";

export default function HomeView({ cv, posts }: { cv: Cv; posts: PostListItem[] }) {
  const { profile } = cv;
  const currentRoles = cv.experience.filter((job) => job.current);

  return (
    <div className="stack-xl">
      <div className="banner">
        <img
          src="/header-dark.svg"
          alt={`${profile.name}: Cybersecurity | Telecom`}
          width={1200}
          height={298}
          className="banner__img banner__img--dark"
        />
        <img src="/header-light.svg" alt="" aria-hidden width={1200} height={298} className="banner__img banner__img--light" />
      </div>

      <section aria-labelledby="hero-title" className="hero fade-in">
        <div className="hero__main">
          <div className="hero__person">
            <img
              src={profile.photo}
              alt={`Portrait of ${profile.name}`}
              width={96}
              height={96}
              className="hero__photo"
            />
            <div className="min-w-0">
              <h1 id="hero-title" className="sr-only">
                {profile.name}, {profile.jobTitle}
              </h1>
              <p className="eyebrow">{profile.jobTitle}</p>
              <p className="hero__headline hero__headline--side">{profile.headline}</p>
            </div>
          </div>
          <p className="hero__bio">{profile.bio}</p>
          <div className="btn-row">
            <Link href="/cv" className="btn btn-primary">
              View CV
              <ArrowRightIcon />
            </Link>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer me" className="btn">
              <GitHubIcon />
              GitHub
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer me" className="btn">
              <LinkedInIcon />
              LinkedIn
            </a>
          </div>
        </div>

        <aside className="hero__aside card" aria-label="Current work and community">
          <div className="hero__identity">
            <img
              src={profile.avatar}
              alt={`${profile.aliases[0]} logo`}
              width={64}
              height={64}
              className="avatar"
            />
            <div className="min-w-0">
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer me" className="hero__handle">
                @{profile.github.login}
              </a>
              <p className="meta-line">
                <PinIcon />
                {profile.location}
              </p>
            </div>
          </div>

          {currentRoles.length > 0 ? (
            <div className="hero__work">
              <h2 className="hero__work-title">
                <span className="status-dot status-dot--current" aria-hidden />
                Currently
              </h2>
              <ul className="role-list">
                {currentRoles.map((job) => (
                  <li key={`${job.organization}-${job.role}`}>
                    <p className="role-list__org">{job.organization}</p>
                    <p className="role-list__role">{job.role}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </section>

      <section aria-labelledby="focus-title">
        <SectionHeader id="focus-title" title="Focus areas & interests" />
        <ul className="tag-list">
          {[...new Set([...profile.skills, ...cv.interests])].map((skill) => (
            <li key={skill} className="tag">
              {skill}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="highlights-title">
        <SectionHeader
          id="highlights-title"
          title="Talks, training and competitions"
          action={{ href: "/cv#achievements", label: "Full CV" }}
        />
        <ul className="post-list">
          {cv.achievements.slice(0, 5).map((item) => (
            <li key={item.id} className="post-row">
              <time dateTime={item.date ?? undefined} className="post-row__date">
                {formatDate(item.date)}
              </time>
              <div className="min-w-0">
                <h3 className="post-row__title">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.title}
                      <ExternalIcon className="inline-link-icon" />
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>
                <p className="post-row__excerpt">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="projects-title">
        <SectionHeader
          id="projects-title"
          title="Selected projects"
          action={{ href: "/projects", label: "All projects" }}
        />
        <ul className="card-grid">
          {cv.featuredProjects.slice(0, 4).map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} headingLevel={3} />
            </li>
          ))}
        </ul>
      </section>

      {posts.length > 0 ? (
        <section aria-labelledby="posts-title">
          <SectionHeader
            id="posts-title"
            title="Latest articles"
            action={{ href: "/articles", label: "All articles" }}
          />
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.id} className="post-row">
                <time dateTime={post.created_at ?? undefined} className="post-row__date">
                  {formatDate(post.created_at)}
                </time>
                <div className="min-w-0">
                  <h3 className="post-row__title">
                    <Link href={`/posts/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="post-row__excerpt">{post.excerpt}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
