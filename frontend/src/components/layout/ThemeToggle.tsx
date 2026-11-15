"use client";

import { useEffect, useRef } from "react";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

export default function ThemeToggle() {
  const active = useRef<ViewTransition | null>(null);
  const intendedTheme = useRef<"light" | "dark" | null>(null);
  const cleanupFrame = useRef(0);

  useEffect(() => () => {
    active.current?.skipTransition();
    window.cancelAnimationFrame(cleanupFrame.current);
    delete document.documentElement.dataset.themeSwitching;
  }, []);

  function toggle() {
    const root = document.documentElement;
    const current = intendedTheme.current ?? root.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    intendedTheme.current = next;
    active.current?.skipTransition();
    window.cancelAnimationFrame(cleanupFrame.current);
    const apply = () => {
      root.dataset.themeSwitching = "true";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {}
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !document.startViewTransition) {
      apply();
      intendedTheme.current = null;
      cleanupFrame.current = window.requestAnimationFrame(() => {
        delete root.dataset.themeSwitching;
      });
      return;
    }

    const transition = document.startViewTransition(apply);
    active.current = transition;
    void transition.ready.catch(() => {});
    void transition.finished.catch(() => {}).finally(() => {
      if (active.current !== transition) return;
      active.current = null;
      intendedTheme.current = null;
      delete root.dataset.themeSwitching;
    });
  }

  return (
    <button type="button" onClick={toggle} className="icon-btn theme-toggle" aria-label="Switch between light and dark theme">
      <SunIcon className="theme-toggle__sun" />
      <MoonIcon className="theme-toggle__moon" />
    </button>
  );
}
