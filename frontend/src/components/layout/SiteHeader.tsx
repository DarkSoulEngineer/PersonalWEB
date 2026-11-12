"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/articles", label: "Articles" },
  { href: "/cv", label: "CV" },
] as const;

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/articles") {
    return pathname === "/articles" || pathname.startsWith("/posts");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="brand" aria-current={pathname === "/" ? "page" : undefined}>
          Milchis
        </Link>
        <div className="site-header__end">
          <nav className="site-nav" aria-label="Main">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="nav-link"
                aria-current={isCurrent(pathname, href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
