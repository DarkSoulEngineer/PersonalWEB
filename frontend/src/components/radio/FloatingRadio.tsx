"use client";

import { CloseIcon, PauseIcon, PlayIcon, VolumeIcon, VolumeMuteIcon } from "./icons";
import { RADIO_TITLE, useRadio } from "./radio-context";

/** The persistent player. It appears once the radio has been started. */
export default function FloatingRadio() {
  const { open, status, isPlaying, muted, toggleMute, toggle, close, volume, setVolume } =
    useRadio();

  if (!open) return null;

  const percent = Math.round(volume * 100);
  const sub =
    status === "error" ? "Stream unavailable" : isPlaying ? "SomaFM, live" : "Paused";

  return (
    <div
      role="region"
      aria-label={`${RADIO_TITLE} radio player`}
      data-state={status}
      className="player"
    >
      <button
        type="button"
        className="player__play"
        onClick={toggle}
        aria-label={isPlaying ? `Pause ${RADIO_TITLE}` : `Play ${RADIO_TITLE}`}
        aria-pressed={isPlaying}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className="player__info">
        <span className="player__title">
          {RADIO_TITLE}
          {isPlaying ? (
            <span className="eq" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          ) : null}
        </span>
        <span className="player__sub">{sub}</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={percent}
        onChange={(event) => setVolume(Number(event.target.value) / 100)}
        className="player__range"
        aria-label={`Volume, ${percent} percent`}
      />

      <button
        type="button"
        className="player__icon-btn"
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        aria-pressed={muted}
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeMuteIcon /> : <VolumeIcon />}
      </button>

      <button
        type="button"
        className="player__icon-btn"
        onClick={close}
        aria-label="Close player"
        title="Close"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
