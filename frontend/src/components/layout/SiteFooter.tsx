import { getCv } from "@/lib/cv";

export default function SiteFooter() {
  const { profile, contact } = getCv();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          © {year} {profile.name}
        </p>
        <ul className="site-footer__links">
          <li>
            <a href={`mailto:${contact.email}`}>Email</a>
          </li>
          <li>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
