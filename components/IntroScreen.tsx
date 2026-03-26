'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      timelineRef.current = tl;

      /* ─── HIDE SCROLL HINT ─── */
      tl.to('.scroll-hint', { opacity: 0, duration: 0.4 }, 0.2);

      /* ─── LOGO OUT ─── */
      tl.to('.logo', {
        opacity: 0,
        scale: 0.85,
        filter: 'blur(20px)',
        duration: 0.8,
      });

      /* ─── SCENE 1 ─── */
      tl.to('.scene1', { opacity: 1, duration: 0.5 });

      tl.fromTo(
        '.scene1 .word',
        { y: 50, opacity: 0, filter: 'blur(12px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          stagger: 0.05,
          duration: 0.9,
          ease: 'power3.out',
        }
      );

      tl.to('.scene1', {
        opacity: 0,
        filter: 'blur(20px)',
        duration: 0.7,
      });

      /* ─── SCENE 2 ─── */
      tl.to('.scene2', { opacity: 1, duration: 0.5 });

      tl.fromTo(
        '.scene2 .word',
        { y: 50, opacity: 0, filter: 'blur(12px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          stagger: 0.05,
          duration: 0.9,
          ease: 'power3.out',
        }
      );

      tl.to('.scene2', {
        opacity: 0,
        filter: 'blur(20px)',
        duration: 0.7,
      });

      /* ─── LIGHT EXPLOSION ─── */
      tl.to('.light-expand', {
        scale: 2.8,
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out',
      });

      /* ─── FLASH IN ─── */
      tl.to('.white-flash', {
        opacity: 1,
        duration: 0.3,
      });

      /* ─── FLASH OUT → HERO ─── */
      tl.to('.white-flash', {
        opacity: 0,
        duration: 0.9,
        onComplete: onDone,
      });
    }, containerRef);

    /* 🔒 LOCK SCROLL */
    document.body.style.overflow = 'hidden';

    /* 🔥 SMOOTH SCROLL CONTROL */
    const SCROLL_POWER = 0.0015;

    const handleScroll = (e: WheelEvent) => {
      if (!timelineRef.current) return;

      const delta = e.deltaY * SCROLL_POWER;

      let next = timelineRef.current.progress() + delta;
      next = Math.max(0, Math.min(1, next));

      gsap.to(timelineRef.current, {
        progress: next,
        duration: 0.6,
        ease: 'power2.out',
      });
    };

    window.addEventListener('wheel', handleScroll, { passive: true });

    return () => {
      ctx.revert();
      window.removeEventListener('wheel', handleScroll);
    };
  }, [onDone]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,_#2a3f5f_0%,_#162035_35%,_#0a1220_65%,_#060c18_100%)]"
    >
      {/* LIGHT RAYS */}
      <div className="light-expand absolute inset-0 opacity-60 scale-100">
        <LightRaysComponent
          {...lightRaysProps}
          raysSpeed={0.8}
          lightSpread={2}
          pulsating
        />
      </div>

      {/* LOGO */}
      <div className="logo absolute inset-0 flex items-center justify-center opacity-100">
        <Image src="/logo/blues-logo.png" width={220} height={220} alt="logo" />
      </div>

      {/* SCROLL HINT */}
      <div className="scroll-hint absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="text-[10px] tracking-[6px] uppercase">
          Scroll to begin
        </span>
        <div className="w-[1px] h-6 bg-white/40 animate-pulse" />
      </div>

      {/* SCENE 1 */}
      <div className="scene1 absolute inset-0 flex flex-col items-center justify-center px-6 opacity-0">
        <div className="absolute inset-0 bg-white/5 blur-3xl opacity-20" />
        {[
          'As you pursue your Purpose,',
          'EVERY MOMENT COUNTS.',
          'You need fewer distractions.',
          'Just quiet certainty.',
        ].map((line, i) => (
          <p
            key={i}
            className="my-2 text-center text-white uppercase tracking-[0.15em] text-sm sm:text-base"
          >
            {line.split(' ').map((word, j) => (
              <span
                key={j}
                className={`word inline-block mr-2 ${
                  i === 1
                    ? 'text-white font-medium tracking-[0.18em]'
                    : 'text-white/70'
                }`}
              >
                {word}
              </span>
            ))}
          </p>
        ))}
      </div>

      {/* SCENE 2 */}
      <div className="scene2 absolute inset-0 flex flex-col items-center justify-center px-6 opacity-0">
        <div className="absolute inset-0 bg-white/5 blur-3xl opacity-20" />
        {[
          'Blue & Blues.',
          'Italian design heritage.',
          'Indian craftsmanship.',
          'Every detail matters.',
        ].map((line, i) => (
          <p
            key={i}
            className="my-2 text-center text-white uppercase tracking-[0.15em] text-sm sm:text-base"
          >
            {line.split(' ').map((word, j) => (
              <span key={j} className="word inline-block mr-2 text-white/70">
                {word}
              </span>
            ))}
          </p>
        ))}
      </div>

      {/* WHITE FLASH */}
      <div className="white-flash absolute inset-0 bg-white opacity-0" />
    </div>
  );
}