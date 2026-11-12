"use client";

import { createContext, useContext } from "react";

/** SomaFM "Seven Inch Soul", the single stream the whole site plays. */
export const RADIO_SRC = "https://ice2.somafm.com/7soul-128-mp3";
export const RADIO_STATION = "7SOUL";
export const RADIO_TITLE = "Seven Inch Soul";

export type RadioStatus = "paused" | "playing" | "error";

export type RadioContextValue = {
  /** Current transport state of the stream. */
  status: RadioStatus;
  /** Convenience flag: `status === "playing"`. */
  isPlaying: boolean;
  /** Whether the floating player is currently on screen. */
  open: boolean;
  /** Playback volume, 0 to 1. */
  volume: number;
  /** Whether audio is currently muted. */
  muted: boolean;
  /** Toggle the mute state. */
  toggleMute: () => void;
  /** Start if paused, stop if playing. */
  toggle: () => void;
  /** Start playback and reveal the floating player. */
  play: () => void;
  /** Stop playback but keep the button state in sync. */
  pause: () => void;
  /** Stop playback and hide the floating player. */
  close: () => void;
  setVolume: (value: number) => void;
};

export const RadioContext = createContext<RadioContextValue | null>(null);

export function useRadio(): RadioContextValue {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error("useRadio must be used inside <RadioProvider>");
  }
  return context;
}
