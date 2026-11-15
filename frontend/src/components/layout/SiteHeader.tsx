"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav";
import ThemeToggle from "./ThemeToggle";
import RadioPlayer from "@/components/radio/RadioPlayer";

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/articles") return pathname === "/articles" || pathname.startsWith("/posts");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container-page site-header__inner">
        <RadioPlayer />
        <div className="site-header__end">
        <nav aria-label="Main">
          <ul className="nav">
            {NAV_ITEMS.map(({ href, label }) => {
              const current = isCurrent(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="nav-link"
                    aria-current={current ? "page" : undefined}
                    onNavigate={(event) => {
                      if (pathname !== href) return;
                      event.preventDefault();
                      if (window.location.hash) {
                        window.history.replaceState(
                          window.history.state,
                          "",
                          `${window.location.pathname}${window.location.search}`,
                        );
                      }
                      window.scrollTo({ top: 0, left: 0 });
                    }}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
