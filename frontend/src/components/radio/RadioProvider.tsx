"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import FloatingRadio from "./FloatingRadio";
import {
  RADIO_SRC,
  RadioContext,
  type RadioContextValue,
  type RadioStatus,
} from "./radio-context";

/**
 * Owns the one and only <audio> element for the station.
 *
 * It lives in the root layout, which Next.js keeps mounted across client-side
 * navigation, so playback continues while the visitor moves between pages
 * (the site's "tabs"). Every play/pause control on the site talks to this
 * provider instead of holding its own audio element.
 */
export default function RadioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<RadioStatus>("paused");
  const [open, setOpen] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMutedState] = useState(false);

  // Reflect the volume state onto the element (also right after it mounts).
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Let the footer make room for the player while it is on screen.
  useEffect(() => {
    document.body.classList.toggle("has-player", open);
    return () => document.body.classList.remove("has-player");
  }, [open]);

  // Reflect the mute state onto the element.
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setOpen(true);
    if (audio.paused) {
      void audio.play().catch(() => setStatus("error"));
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    setOpen(true);
    void audio.play().catch(() => setStatus("error"));
  }, []);

  const close = useCallback(() => {
    audioRef.current?.pause();
    setOpen(false);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.min(1, Math.max(0, value)));
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((current) => !current);
  }, []);

  const value = useMemo<RadioContextValue>(
    () => ({
      status,
      isPlaying: status === "playing",
      open,
      volume,
      muted,
      toggle,
      play,
      pause,
      close,
      setVolume,
      toggleMute,
    }),
    [status, open, volume, muted, toggle, play, pause, close, setVolume, toggleMute],
  );

  return (
    <RadioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={RADIO_SRC}
        preload="none"
        onPlaying={() => {
          setStatus("playing");
          setOpen(true);
        }}
        onPause={() =>
          setStatus((current) => (current === "playing" ? "paused" : current))
        }
        onError={() => setStatus("error")}
      />
      <FloatingRadio />
    </RadioContext.Provider>
  );
}
