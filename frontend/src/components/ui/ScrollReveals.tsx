"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR = ".hero__aside, .card-grid > li, .post-list--highlights > .post-row";

function observeContent(root: HTMLElement) {
  const tracked = new Set<HTMLElement>();
  const reveal = (element: HTMLElement) => {
    element.dataset.scrollReveal = "visible";
    observer.unobserve(element);
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) reveal(entry.target as HTMLElement);
    }
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0 });

  function register(element: HTMLElement, animateVisible: boolean) {
    if (tracked.has(element)) return;
    tracked.add(element);
    const rect = element.getBoundingClientRect();
    // Never hide content that is already on screen or above a deep link.
    if (rect.top < 0 || (!animateVisible && rect.top < window.innerHeight * 0.94)) {
      element.dataset.scrollReveal = "visible";
      return;
    }
    const siblings = element.parentElement?.children;
    const index = siblings ? Array.from(siblings).indexOf(element) : 0;
    element.style.setProperty("--reveal-delay", `${Math.min(index, 3) * 45}ms`);
    observer.observe(element);
    element.dataset.scrollReveal = "pending";
  }

  function discover(node: Element, animateVisible = false) {
    if (node instanceof HTMLElement && node.matches(SELECTOR)) register(node, animateVisible);
    node.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => register(element, animateVisible));
  }

  discover(root);
  const mutations = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (node instanceof Element) discover(node, true);
      });
    }
    for (const element of tracked) {
      if (!root.contains(element)) {
        observer.unobserve(element);
        tracked.delete(element);
      }
    }
  });
  mutations.observe(root, { childList: true, subtree: true });

  function handleFocus(event: FocusEvent) {
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLElement>("[data-scroll-reveal]");
    if (element) {
      element.style.setProperty("--reveal-delay", "0ms");
      reveal(element);
    }
  }
  root.addEventListener("focusin", handleFocus);

  return () => {
    observer.disconnect();
    mutations.disconnect();
    root.removeEventListener("focusin", handleFocus);
    for (const element of tracked) {
      delete element.dataset.scrollReveal;
      element.style.removeProperty("--reveal-delay");
    }
  };
}

export default function ScrollReveals() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.getElementById("content");
    if (!root || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};
    function configure() {
      stop();
      stop = preference.matches ? () => {} : observeContent(root!);
    }
    configure();
    preference.addEventListener("change", configure);
    return () => {
      stop();
      preference.removeEventListener("change", configure);
    };
  }, [pathname]);

  return null;
}
