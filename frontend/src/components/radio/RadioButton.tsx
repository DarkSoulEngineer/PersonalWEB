"use client";

import { PauseIcon, PlayIcon } from "./icons";
import { RADIO_TITLE, useRadio } from "./radio-context";

/**
 * Card in the home hero that starts the station. Once playback starts the
 * floating player takes over, so the card hides until that player is closed.
 */
export default function RadioButton() {
  const { open, status, isPlaying, toggle } = useRadio();

  if (open) return null;

  const hint = isPlaying
    ? "Playing on SomaFM"
    : status === "error"
      ? "Stream unavailable, tap to retry"
      : "Play some soul while you read";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isPlaying}
      aria-label={`${isPlaying ? "Pause" : "Play"} ${RADIO_TITLE} radio`}
      className="radio-card"
      data-state={status}
    >
      <span className="radio-card__icon" aria-hidden>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </span>
      <span className="radio-card__text">
        <span className="radio-card__title">{RADIO_TITLE}</span>
        <span className="radio-card__sub">{hint}</span>
      </span>
    </button>
  );
}
