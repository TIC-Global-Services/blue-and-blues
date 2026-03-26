'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState, ReactNode } from 'react';

interface AudioContextValue {
  playing: boolean;
  toggle: () => void;
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

    const tap = new Audio('/music/tap.wav');
    tap.volume = 0.5;
    tapRef.current = tap;

    const hover = new Audio('/music/hover.mp3');
    hover.volume = 0.3;
    hoverRef.current = hover;

    return () => {
      soundtrack.pause();
      soundtrack.src = '';
      tap.src = '';
      hover.src = '';
    };
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
    <AudioCtx.Provider value={{ playing, toggle, playTap, playHover }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used inside AudioProvider');
  return ctx;
}
