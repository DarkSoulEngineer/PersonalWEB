"use client";

import { PauseIcon, PlayIcon, VolumeIcon, VolumeMuteIcon } from "@/components/ui/icons";
import { RADIO_STATION, RADIO_TITLE, useRadio } from "./radio-context";

export default function RadioPlayer() {
  const { status, isPlaying, muted, toggleMute, toggle, volume, setVolume } = useRadio();

  const percent = Math.round(volume * 100);

  return (
    <div role="region" aria-label={`${RADIO_TITLE} radio player`} data-state={status} className="header-radio">
      <button
        type="button"
        className="icon-btn header-radio__play"
        onClick={toggle}
        aria-label={isPlaying ? `Pause ${RADIO_TITLE}` : status === "error" ? `Retry ${RADIO_TITLE}` : `Play ${RADIO_TITLE}`}
        aria-pressed={isPlaying}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className="player__info">
        <span className="player__station">
          <span className={`status-dot${isPlaying ? " status-dot--live" : ""}`} aria-hidden />
          {RADIO_STATION}
        </span>
        <span className="player__title">{status === "error" ? "Stream unavailable" : RADIO_TITLE}</span>
      </div>

      <button
        type="button"
        className="icon-btn"
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        aria-pressed={muted}
      >
        {muted ? <VolumeMuteIcon /> : <VolumeIcon />}
      </button>

      <input
        type="range"
        min={0}
        max={100}
        value={percent}
        onChange={(event) => setVolume(Number(event.target.value) / 100)}
        className="player__range"
        aria-label={`Volume ${percent} percent`}
      />

    </div>
  );
}
