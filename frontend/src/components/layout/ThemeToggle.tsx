"use client";

import { MoonIcon, SunIcon } from "@/components/ui/icons";

export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button type="button" onClick={toggle} className="icon-btn theme-toggle" aria-label="Switch between light and dark theme">
      <SunIcon className="theme-toggle__sun" />
      <MoonIcon className="theme-toggle__moon" />
    </button>
  );
}
