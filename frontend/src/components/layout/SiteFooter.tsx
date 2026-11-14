import Link from "next/link";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/icons";
import { getCv } from "@/lib/cv";
import { NAV_ITEMS } from "./nav";

export default function SiteFooter() {
  const { profile, contact } = getCv();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container-page site-footer__inner">
        <div className="site-footer__about">
          <p className="brand">
            <span className="text-accent">M</span>ilchis
          </p>
          <p className="text-sm text-muted">
            {profile.jobTitle}, {profile.location}
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="site-footer__links">
            {NAV_ITEMS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="link-muted">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="site-footer__social">
          <li>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer me" className="icon-link" aria-label="GitHub">
              <GitHubIcon width={18} height={18} />
            </a>
          </li>
          <li>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer me" className="icon-link" aria-label="LinkedIn">
              <LinkedInIcon width={18} height={18} />
            </a>
          </li>
          <li>
            <a href={`mailto:${contact.email}`} className="icon-link" aria-label="Email">
              <MailIcon width={18} height={18} />
            </a>
          </li>
        </ul>
      </div>
      <div className="container-page">
        <div className="site-footer__legal">
          <span>
            © {year} {profile.name}
          </span>
          <span>{profile.aliases[0]}</span>
        </div>
      </div>
    </footer>
  );
}
