'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface IntroScreenProps {
  onDone: () => void;
  LightRaysComponent: React.ComponentType<any>;
  lightRaysProps: Record<string, any>;
}

export default function IntroScreen({
  onDone,
  LightRaysComponent,
  lightRaysProps,
}: IntroScreenProps) {
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);

  const scrollRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const autoPlayRef = useRef(false);

  const [, forceRender] = useState(0);

  const SCROLL_LENGTH = 2000; // 🔥 increase = longer experience

  const clamp = (v: number, min = 0, max = 1) =>
    Math.min(max, Math.max(min, v));

  const map = (
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ) => {
    const t = clamp((value - inMin) / (inMax - inMin));
    return outMin + (outMax - outMin) * t;
  };

  useEffect(() => {
    /* ───────── RAF SMOOTHING ───────── */
    const animate = () => {
      // smooth easing (inertia)
      progressRef.current +=
        (targetProgressRef.current - progressRef.current) * 0.08;

      forceRender((v) => v + 1);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    /* ───────── SCROLL CONTROL ───────── */
    const handleScroll = (e: WheelEvent) => {
      if (autoPlayRef.current) return;

      scrollRef.current += e.deltaY;
      scrollRef.current = clamp(scrollRef.current, 0, SCROLL_LENGTH);

      targetProgressRef.current = scrollRef.current / SCROLL_LENGTH;

      // 🔥 auto-finish ending
      if (targetProgressRef.current > 0.92 && !autoPlayRef.current) {
        autoPlayRef.current = true;

        const start = progressRef.current;
        const startTime = performance.now();
        const duration = 1200;

        const auto = (t: number) => {
          const elapsed = t - startTime;
          const p = clamp(elapsed / duration);

          progressRef.current = start + (1 - start) * p;

          if (p < 1) requestAnimationFrame(auto);
          else onDone();
        };

        requestAnimationFrame(auto);
      }
    };

    /* ───────── TOUCH CONTROL ───────── */
    let lastTouchY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (autoPlayRef.current) return;

      const dy = lastTouchY - e.touches[0].clientY;
      lastTouchY = e.touches[0].clientY;

      scrollRef.current += dy * 1.5;
      scrollRef.current = clamp(scrollRef.current, 0, SCROLL_LENGTH);

      targetProgressRef.current = scrollRef.current / SCROLL_LENGTH;
    };

    window.addEventListener('wheel', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    window.addEventListener('touchmove', handleTouchMove, {
      passive: true,
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [onDone]);

  const p = progressRef.current;

  /* ───────── CINEMATIC TIMELINE ───────── */

  const logoOpacity = 1 - map(p, 0.05, 0.2, 0, 1);
  const logoScale = 1 - map(p, 0.05, 0.2, 0, 0.2);

  const scene1Opacity =
    map(p, 0.15, 0.45, 0, 1) *
    (1 - map(p, 0.45, 0.65, 0, 1));

  const scene2Opacity =
    map(p, 0.55, 0.75, 0, 1) *
    (1 - map(p, 0.75, 0.9, 0, 1));

  const lightScale = 1 + map(p, 0.6, 1, 0, 26);
  const lightOpacity = map(p, 0.55, 0.8, 0.6, 1);

  const whiteOpacity =
    map(p, 0.75, 0.9, 0, 1) *
    (1 - map(p, 0.9, 1, 0, 1));

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#060c18]">
      {/* LIGHT RAYS */}
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${lightScale})`,
          opacity: lightOpacity,
          willChange: 'transform, opacity',
        }}
      >
        <LightRaysComponent {...lightRaysProps} />
      </div>

      {/* LOGO */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
          willChange: 'transform, opacity',
        }}
      >
        <Image
          src="/logo/blues-logo.png"
          width={220}
          height={220}
          alt="logo"
        />
      </div>

      {/* SCENE 1 */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: scene1Opacity }}
      >
        <p className="text-white/40 tracking-[0.4em] text-xs uppercase">
          A quiet legacy
        </p>
        <h1 className="text-white text-4xl sm:text-6xl font-semibold mt-2">
          born in Milan,
        </h1>
        <p className="text-white/40 tracking-[0.4em] text-xs uppercase mt-2">
          beautifully grounded in
        </p>
        <h2 className="text-[#7EC9DA] text-xl sm:text-2xl mt-2">
          Indian Craftsmanship
        </h2>
      </div>

      {/* SCENE 2 */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: scene2Opacity }}
      >
        <p className="text-white/40 tracking-[0.4em] text-xs uppercase">
          Crafting pieces that evolve alongside you,
        </p>
        <p className="text-white/60 text-lg mt-3">
          Not just carried, but lived.
        </p>
        <h1 className="text-white text-4xl sm:text-6xl font-bold mt-6">
          BLUE <span className="font-inter">&</span> BLUES.
        </h1>
      </div>

      {/* WHITE FLASH */}
      <div
        className="absolute inset-0 bg-white"
        style={{ opacity: whiteOpacity }}
      />
    </div>
  );
}