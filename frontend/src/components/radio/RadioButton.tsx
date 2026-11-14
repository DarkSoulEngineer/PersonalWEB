"use client";

import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { RADIO_TITLE, useRadio } from "./radio-context";

export default function RadioButton() {
  const { status, isPlaying, toggle } = useRadio();

  const label = isPlaying ? "Pause radio" : status === "error" ? "Retry radio" : "Play radio";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isPlaying}
      data-state={status}
      className="icon-btn radio-btn"
      aria-label={`${label}: ${RADIO_TITLE}`}
      title={`${label}: ${RADIO_TITLE}`}
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}
