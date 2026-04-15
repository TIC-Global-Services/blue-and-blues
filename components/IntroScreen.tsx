'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface IntroScreenProps {
  onDone: () => void;
  LightRaysComponent: React.ComponentType<any>;
  lightRaysProps: Record<string, any>;
}

const TOTAL_SCENES = 3;

export default function IntroScreen({
  onDone,
  LightRaysComponent,
  lightRaysProps,
}: IntroScreenProps) {
  const targetSceneRef = useRef(0);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const isAnimatingRef = useRef(false);
  const touchStartY = useRef(0);

  const [, forceRender] = useState(0);

  const clamp = (v: number, min = 0, max = TOTAL_SCENES) =>
    Math.min(max, Math.max(min, v));

  /* ───────── CLEAN ANIMATION ───────── */

  const getSceneProgress = (index: number) => {
    return Math.max(0, 1 - Math.abs(progressRef.current - index));
  };

  const getStyle = (index: number) => {
    const t = getSceneProgress(index);

    return {
      opacity: t,
      transform: `translateY(${(1 - t) * 24}px)`,
      transition: 'all 0.45s cubic-bezier(0.22,1,0.36,1)',
    };
  };

  /* ───────── LOOP ───────── */

  useEffect(() => {
    const animate = () => {
      const target = targetSceneRef.current;

      progressRef.current += (target - progressRef.current) * 0.12;

      if (Math.abs(progressRef.current - target) < 0.001) {
        progressRef.current = target;
        isAnimatingRef.current = false;
      }

      forceRender((v) => v + 1);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleWheel = (e: WheelEvent) => {
      if (isAnimatingRef.current) return;

      targetSceneRef.current =
        e.deltaY > 0
          ? clamp(targetSceneRef.current + 1)
          : clamp(targetSceneRef.current - 1);

      isAnimatingRef.current = true;
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimatingRef.current) return;

      const dy = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 40) return;

      targetSceneRef.current =
        dy > 0
          ? clamp(targetSceneRef.current + 1)
          : clamp(targetSceneRef.current - 1);

      isAnimatingRef.current = true;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onDone]);

  const p = progressRef.current;

  /* ───────── EXIT ───────── */
  useEffect(() => {
    if (p >= TOTAL_SCENES && !isAnimatingRef.current) {
      onDone();
    }
  }, [p, onDone]);

  /* ───────── LIGHT ───────── */

  const lightScale = 1 + p * 6;
  const lightOpacity = 0.7;

  /* ───────── FLASH ───────── */

  const whiteOpacity =
    p > 2.7 ? Math.min((p - 2.7) * 4, 1) : 0;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#060c18] overflow-hidden">
      {/* LIGHT */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${lightScale})`,
          opacity: lightOpacity,
        }}
      >
        <LightRaysComponent {...lightRaysProps} />
      </div>

      {/* LOGO */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={getStyle(0)}
      >
        <Image src="/logo/blues-logo.png" width={180} height={180} alt="logo" />
      </div>

      {/* SCENE 1 */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        style={getStyle(1)}
      >
        <p className="text-white/30 text-[14px] tracking-[0.4em] uppercase">
          A QUIET LEGACY
        </p>

        <h1 className="text-white text-4xl sm:text-6xl font-medium mt-3 leading-tight">
          Born in Milan
        </h1>

        <p className="text-white/40 text-lg mt-4 uppercase font-semibold tracking-[0.3em]">
          Crafted in India
        </p>
      </div>

      {/* SCENE 2 */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        style={getStyle(2)}
      >
        <p className="text-white/40 text-sm font-medium uppercase tracking-[0.3em]">
          Designed to evolve with you
        </p>

        <h1 className="text-white text-4xl sm:text-6xl font-semibold mt-6 leading-tight">
          BLUE <span className="font-inter">&</span> BLUES
        </h1>
      </div>

      {/* FLASH */}
      <div
        className="absolute inset-0 bg-white"
        style={{ opacity: whiteOpacity }}
      />

      {/* HINT */}
      {Math.round(p) === 0 && (
        <div className="absolute bottom-10 w-full text-center text-white/40 text-xs tracking-widest animate-pulse">
          SWIPE / SCROLL
        </div>
      )}
    </div>
  );
}