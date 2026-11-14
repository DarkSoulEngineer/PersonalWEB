"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  RADIO_SRC,
  RadioContext,
  type RadioContextValue,
  type RadioStatus,
} from "./radio-context";

export default function RadioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<RadioStatus>("paused");
  const [open, setOpen] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

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
    </RadioContext.Provider>
  );
}
