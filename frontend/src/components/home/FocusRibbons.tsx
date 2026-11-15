"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";

function Ribbon({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className={`interest-ribbon${reverse ? " interest-ribbon--reverse" : ""}`} aria-hidden="true">
      <div className="interest-ribbon__track">
        {[false, true].map((copy) => (
          <div
            key={String(copy)}
            className={`interest-ribbon__group${copy ? " interest-ribbon__group--copy" : ""}`}
          >
            {items.map((item) => <span key={item} className="interest-ribbon__item">{item}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FocusRibbons({ skills, interests }: { skills: string[]; interests: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const focus = [...new Set(skills)];
  const hobbies = [...new Set(interests)];
  const all = [...new Set([...focus, ...hobbies])];

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.dataset.ribbonReady = "true";
    return () => { delete element.dataset.ribbonReady; };
  }, []);

  return (
    <div ref={ref} className="focus-ribbons" data-paused={paused}>
      <div className="section-header">
        <h2 id="focus-title" className="section-title">Focus areas & interests</h2>
        <button
          type="button"
          className="icon-btn focus-ribbons__toggle"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "Resume interest ribbons" : "Pause interest ribbons"}
          aria-pressed={paused}
          title={paused ? "Resume motion" : "Pause motion"}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      </div>
      <ul className="sr-only" aria-label="Focus areas and interests">
        {all.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <div className="focus-ribbons__rows">
        <Ribbon items={focus} />
        <Ribbon items={hobbies} reverse />
      </div>
    </div>
  );
}
