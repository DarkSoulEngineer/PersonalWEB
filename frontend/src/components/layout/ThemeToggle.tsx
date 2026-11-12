"use client";

import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next: Theme = currentTheme() === "light" ? "dark" : "light";

    // Animate colours only for the switch itself, not on every hover.
    root.classList.add("theme-switching");
    root.dataset.theme = next;
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      meta.content = next === "light" ? "#eceee6" : "#222325";
    }
    window.setTimeout(() => root.classList.remove("theme-switching"), 300);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the switch still works for this visit.
    }
  }

  // Both icons are rendered; CSS shows the right one from data-theme, so the
  // server markup never mismatches the visitor's saved theme.
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
    >
      <svg className="icon-sun" viewBox="0 0 20 20" aria-hidden>
        <circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <svg className="icon-moon" viewBox="0 0 20 20" aria-hidden>
        <path
          d="M16.5 12.4A7 7 0 0 1 7.6 3.5a7 7 0 1 0 8.9 8.9z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
