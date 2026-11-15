"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CV_SECTIONS, CvIndex, type CvSectionId } from "./CvIndex";
import PrintButton from "./PrintButton";

export default function CvToolbar() {
  const [hidden, setHidden] = useState(false);
  const [activeId, setActiveId] = useState<CvSectionId>("summary");
  const toolbarRef = useRef<HTMLDivElement>(null);
  const navigating = useRef(false);
  const anchor = useRef<CvSectionId | null>(null);
  const extraSpace = useRef(0);

  const alignSection = useCallback((id: CvSectionId, smooth: boolean) => {
    const toolbar = toolbarRef.current;
    const target = document.getElementById(id);
    const cv = toolbar?.closest<HTMLElement>(".cv");
    if (!toolbar || !target || !cv) return;

    const headerHeight = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top
      - headerHeight - toolbar.offsetHeight - 16);

    // Only add space if a short final section cannot otherwise reach the header.
    const available = document.documentElement.scrollHeight - window.innerHeight - extraSpace.current;
    const needed = Math.max(0, Math.ceil(top - available));
    cv.style.setProperty("--cv-anchor-space", `${needed}px`);
    extraSpace.current = needed;
    navigating.current = true;
    window.scrollTo({ top, behavior: smooth ? "smooth" : "instant" });
  }, []);

  function navigateTo(id: CvSectionId) {
    anchor.current = id;
    setActiveId(id);
    setHidden(false);
    if (window.location.hash !== `#${id}`) {
      window.history.pushState(window.history.state, "", `#${id}`);
    }
    alignSection(id, !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 760px)");
    const cv = toolbarRef.current?.closest<HTMLElement>(".cv");
    let lastY = window.scrollY;
    let frame = 0;
    let mounted = true;

    function updateActiveSection() {
      const header = document.querySelector<HTMLElement>(".site-header");
      const marker = (header?.offsetHeight ?? 0) + (toolbarRef.current?.offsetHeight ?? 0) + 24;
      let current: CvSectionId = "summary";
      for (const section of CV_SECTIONS) {
        if ((document.getElementById(section.id)?.getBoundingClientRect().top ?? Infinity) <= marker) {
          current = section.id;
        }
      }
      setActiveId(current);
    }

    function handleScroll() {
      const y = Math.max(0, window.scrollY);
      if (navigating.current) {
        lastY = y;
        return;
      }
      if (y !== lastY) anchor.current = null;
      updateActiveSection();
      if (!mobile.matches) {
        lastY = y;
        return;
      }
      if (y <= 96) {
        setHidden(false);
        lastY = y;
        return;
      }
      // Ignore tiny movements so touch scrolling does not flicker the toolbar.
      if (Math.abs(y - lastY) < 8) return;
      setHidden(y > lastY);
      lastY = y;
    }

    function handleBreakpoint() {
      lastY = window.scrollY;
      navigating.current = false;
      setHidden(false);
    }

    function finishNavigation() {
      const target = anchor.current && document.getElementById(anchor.current);
      if (target && toolbarRef.current) {
        const headerHeight = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
        const expectedTop = headerHeight + toolbarRef.current.offsetHeight + 16;
        // A cancelled, earlier smooth scroll can emit scrollend after a new jump.
        if (Math.abs(target.getBoundingClientRect().top - expectedTop) > 2) return;
      }
      navigating.current = false;
    }

    function handleUserInput() {
      anchor.current = null;
      navigating.current = false;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
        handleUserInput();
      }
    }

    const root = document.documentElement;
    const previousHeight = root.style.getPropertyValue("--cv-toolbar-h");
    function measureLayout() {
      if (toolbarRef.current) {
        root.style.setProperty("--cv-toolbar-h", `${toolbarRef.current.offsetHeight}px`);
      }
      if (anchor.current) alignSection(anchor.current, false);
    }
    const observer = new ResizeObserver(measureLayout);
    if (toolbarRef.current) observer.observe(toolbarRef.current);
    const header = document.querySelector(".site-header");
    const sheet = document.querySelector(".cv-sheet");
    if (header) observer.observe(header);
    if (sheet) observer.observe(sheet);

    function restoreHash() {
      const section = CV_SECTIONS.find(({ id }) => `#${id}` === window.location.hash);
      if (!section) {
        anchor.current = null;
        return;
      }
      anchor.current = section.id;
      setActiveId(section.id);
      setHidden(false);
      alignSection(section.id, false);
    }

    frame = window.requestAnimationFrame(() => {
      updateActiveSection();
      restoreHash();
    });
    void document.fonts.ready.then(() => {
      if (mounted && anchor.current) alignSection(anchor.current, false);
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scrollend", finishNavigation);
    window.addEventListener("wheel", handleUserInput, { passive: true });
    window.addEventListener("touchmove", handleUserInput, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("hashchange", restoreHash);
    window.addEventListener("popstate", restoreHash);
    mobile.addEventListener("change", handleBreakpoint);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scrollend", finishNavigation);
      mounted = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("wheel", handleUserInput);
      window.removeEventListener("touchmove", handleUserInput);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("hashchange", restoreHash);
      window.removeEventListener("popstate", restoreHash);
      mobile.removeEventListener("change", handleBreakpoint);
      observer.disconnect();
      cv?.style.removeProperty("--cv-anchor-space");
      if (previousHeight) {
        root.style.setProperty("--cv-toolbar-h", previousHeight);
      } else {
        root.style.removeProperty("--cv-toolbar-h");
      }
    };
  }, [alignSection]);

  return (
    <div ref={toolbarRef} className="cv-toolbar" data-scroll-hidden={hidden} inert={hidden}>
      <div className="container-page cv-toolbar__inner">
        <CvIndex activeId={activeId} onNavigate={navigateTo} />
        <PrintButton />
      </div>
    </div>
  );
}
