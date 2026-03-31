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
  const autoPlayRef = useRef(false);

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
        duration: 0.4,
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

      /* ─── SCENE 2 OUT → triggers auto-play of the ending ─── */
      tl.to('.scene2', {
        opacity: 0,
        filter: 'blur(20px)',
        duration: 0.7,
        onComplete: () => {
          if (autoPlayRef.current) return;
          autoPlayRef.current = true;
          // Auto-drive the rest of the timeline to completion
          gsap.to(timelineRef.current!, {
            progress: 1,
            duration: 3,
            ease: 'power2.inOut',
          });
        },
      });

      /* ─── LIGHT RAYS BLAST TO FULL SCREEN ─── */
      tl.fromTo(
        '.light-expand',
        { scale: 1, opacity: 0.6, filter: 'brightness(1)' },
        {
          scale: 22,
          opacity: 1,
          filter: 'brightness(8)',
          duration: 2.4,
          ease: 'power3.in',
        }
      );

      /* ─── WHITE FLASH IN — rides in on the brightness peak ─── */
      tl.to('.white-flash', {
        opacity: 1,
        duration: 0.35,
        ease: 'power2.in',
      }, '-=0.5');

      /* ─── WHITE BLOOM OUT → HERO ─── */
      tl.to('.white-flash', {
        opacity: 0,
        duration: 1.1,
        ease: 'power1.out',
        onComplete: onDone,
      });
    }, containerRef);

    /* 🔒 LOCK SCROLL */
    document.body.style.overflow = 'hidden';

    /* SMOOTH SCROLL CONTROL */
    const SCROLL_POWER = 0.0009;

    const handleScroll = (e: WheelEvent) => {
      // Once auto-play has kicked in, ignore scroll input
      if (!timelineRef.current || autoPlayRef.current) return;

      const delta = e.deltaY * SCROLL_POWER;
      let next = timelineRef.current.progress() + delta;
      next = Math.max(0, Math.min(1, next));

      gsap.to(timelineRef.current, {
        progress: next,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: true, // kill any in-flight tween so they don't pile up
      });
    };

    window.addEventListener('wheel', handleScroll, { passive: true });

    return () => {
      ctx.revert();
      window.removeEventListener('wheel', handleScroll);
      document.body.style.overflow = '';
    };
  }, [onDone]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,_#2a3f5f_0%,_#162035_35%,_#0a1220_65%,_#060c18_100%)]"
    >
      {/* LIGHT RAYS */}
      <div className="light-expand absolute inset-0 opacity-60">
        <LightRaysComponent
          {...lightRaysProps}
          raysSpeed={0.6}
          lightSpread={6}
          rayLength={10}
          fadeDistance={8}
          followMouse={false}
          pulsating={false}
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
      <div className="scene1 absolute inset-0 flex flex-col items-center justify-center px-6 opacity-0 gap-1">
        <div className="absolute inset-0 bg-white/5 blur-3xl opacity-20" />
        {/* "A quiet legacy" — small, wide-tracked, dim */}
        <p className="text-center uppercase tracking-[0.45em] text-[10px] sm:text-xs text-white/35 font-medium">
          {'A quiet legacy'.split(' ').map((word, j) => (
            <span key={j} className="word inline-block mr-[0.45em]">{word}</span>
          ))}
        </p>
        {/* "born in Milan," — large, tight, bright */}
        <p className="text-center uppercase tracking-[0.06em] text-3xl sm:text-5xl text-white font-semibold leading-none">
          {'born in Milan,'.split(' ').map((word, j) => (
            <span key={j} className="word inline-block mr-[0.18em]">{word}</span>
          ))}
        </p>
        {/* "beautifully grounded in" — small, wide, dim */}
        <p className="text-center uppercase tracking-[0.45em] text-[10px] sm:text-xs text-white/35 font-medium">
          {'beautifully grounded in'.split(' ').map((word, j) => (
            <span key={j} className="word inline-block mr-[0.45em]">{word}</span>
          ))}
        </p>
        {/* "Indian Craftsmanship" — medium, brand accent */}
        <p className="text-center uppercase tracking-[0.12em] text-xl sm:text-2xl text-[#7EC9DA] font-medium">
          {'Indian Craftsmanship'.split(' ').map((word, j) => (
            <span key={j} className="word inline-block mr-[0.25em]">{word}</span>
          ))}
        </p>
      </div>

      {/* SCENE 2 */}
      <div className="scene2 absolute inset-0 flex flex-col items-center justify-center px-6 opacity-0 gap-1">
        <div className="absolute inset-0 bg-white/5 blur-3xl opacity-20" />
        {/* "Crafting pieces…" — small, wide, dim */}
        <p className="text-center uppercase tracking-[0.4em] text-[10px] sm:text-xs text-white/35 font-medium">
          {'Crafting pieces that evolve alongside you,'.split(' ').map((word, j) => (
            <span key={j} className="word inline-block mr-[0.4em]">{word}</span>
          ))}
        </p>
        {/* "Not just carried, but lived." — medium, softer white */}
        <p className="text-center uppercase tracking-[0.2em] text-base sm:text-lg text-white/60 font-normal mt-3">
          {'Not just carried, but lived.'.split(' ').map((word, j) => (
            <span key={j} className="word inline-block mr-[0.3em]">{word}</span>
          ))}
        </p>
        {/* "BLUE&BLUES." — hero moment: large, bold, full white */}
        <p className="text-center uppercase  text-4xl sm:text-6xl text-white font-bold mt-5 ">
          {'BLUE & BLUES.'.split(' ').map((word, j) => (
            <span key={j} className="word inline-block">{word}</span>
          ))}
        </p>
      </div>

      {/* WHITE BLOOM */}
      <div className="white-flash absolute inset-0 bg-white opacity-0" />
    </div>
  );
}
