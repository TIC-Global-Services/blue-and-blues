'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState, ReactNode } from 'react';

interface AudioContextValue {
  playing: boolean;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  playTap: () => void;
  playHover: () => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const soundtrackRef = useRef<HTMLAudioElement | null>(null);
  const tapRef = useRef<HTMLAudioElement | null>(null);
  const hoverRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const soundtrack = new Audio('/music/soundtrack.mp3');
    soundtrack.loop = true;
    soundtrack.volume = 0.25;
    soundtrackRef.current = soundtrack;

    const tap = new Audio('/music/water-tap.wav');
    tap.volume = 0.08;
    tapRef.current = tap;

    const hover = new Audio('/music/hover.mp3');
    hover.volume = 0.1;
    hoverRef.current = hover;

    return () => {
      soundtrack.pause();
      soundtrack.src = '';
      tap.src = '';
      hover.src = '';
    };
  }, []);

  const play = useCallback(() => {
    const audio = soundtrackRef.current;
    if (!audio) return;
    audio.play().then(() => setPlaying(true)).catch(() => {});
  }, []);

  const pause = useCallback(() => {
    const audio = soundtrackRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    const audio = soundtrackRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [playing]);

  const playTap = useCallback(() => {
    if (!playing) return;
    const tap = tapRef.current;
    if (!tap) return;
    tap.currentTime = 0;
    tap.play().catch(() => {});
  }, [playing]);

  const playHover = useCallback(() => {
    if (!playing) return;
    const hover = hoverRef.current;
    if (!hover) return;
    hover.currentTime = 0;
    hover.play().catch(() => {});
  }, [playing]);

  return (
    <AudioCtx.Provider value={{ playing, toggle, play, pause, playTap, playHover }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used inside AudioProvider');
  return ctx;
}
