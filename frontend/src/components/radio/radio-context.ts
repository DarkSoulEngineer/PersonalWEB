"use client";

import { createContext, useContext } from "react";

export const RADIO_SRC = "https://ice2.somafm.com/7soul-128-mp3";
export const RADIO_STATION = "7SOUL";
export const RADIO_TITLE = "Seven Inch Soul";

export type RadioStatus = "paused" | "playing" | "error";

export type RadioContextValue = {
  status: RadioStatus;
  isPlaying: boolean;
  open: boolean;
  volume: number;
  muted: boolean;
  toggleMute: () => void;
  toggle: () => void;
  play: () => void;
  pause: () => void;
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
