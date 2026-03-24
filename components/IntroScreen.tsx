'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroScreenProps {
  onDone: () => void;
  LightRaysComponent: React.ComponentType<any>;
  lightRaysProps: Record<string, any>;
}

/* ─── Copy ───────────────────────────────────────── */
const SCENE_1 = [
  'As you pursue your Purpose,',
  'EVERY MOMENT COUNTS.',
  'You need fewer distractions. Fewer decisions.',
  'Just quiet certainty & confidence.',
];

const SCENE_2 = [
  'Blue & Blues.',
  'Crafted in the tradition of Italian design heritage.',
  'Made real through Indian artistry.',
  'Where form follows meaning,',
  'and every detail serves a reason.',
];

/* ─── Config ─────────────────────────────────────── */
const MAX_STEP = 3;
const SCROLL_COOLDOWN = 1100; // lock per step
const WHEEL_THRESHOLD = 60;
const TOUCH_THRESHOLD = 50;

/* ─── Component ─────────────────────────────────── */
export default function IntroScreen({
  onDone,
  LightRaysComponent,
  lightRaysProps,
}: IntroScreenProps) {
  const [step, setStep] = useState(0);

  const lastTriggerTime = useRef(0);
  const wheelAccum = useRef(0);
  const touchStartY = useRef<number | null>(null);

  /* ─── STEP CONTROL (CORE) ─────────────────────── */
  const handleStep = useCallback((direction: number) => {
    const now = Date.now();

    // 🚫 lock scroll during cooldown
    if (now - lastTriggerTime.current < SCROLL_COOLDOWN) return;

    lastTriggerTime.current = now;

    setStep((prev) => {
      const next = Math.min(MAX_STEP, Math.max(0, prev + direction));
      return next;
    });
  }, []);

  /* ─── INPUT LISTENERS ─────────────────────────── */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      wheelAccum.current += e.deltaY;

      if (Math.abs(wheelAccum.current) > WHEEL_THRESHOLD) {
        handleStep(wheelAccum.current > 0 ? 1 : -1);
        wheelAccum.current = 0;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;

      const dy = touchStartY.current - e.touches[0].clientY;

      if (Math.abs(dy) > TOUCH_THRESHOLD) {
        handleStep(dy > 0 ? 1 : -1);
        touchStartY.current = null;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'Space') handleStep(1);
      if (e.code === 'ArrowUp') handleStep(-1);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [handleStep]);

  /* ─── FINAL HERO TRIGGER ─────────────────────── */
  useEffect(() => {
    if (step === 3) {
      const t = setTimeout(onDone, 1000);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  return (
    <div className="fixed inset-0 z-[9998] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, #2a3f5f 0%, #162035 35%, #0a1220 65%, #060c18 100%)',
        }}
      />

      {/* Light Rays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <LightRaysComponent {...lightRaysProps} className="absolute inset-0" />
      </div>

      {/* Scenes */}
      <AnimatePresence mode="wait">
        {step === 0 && <LogoScene key="logo" />}
        {step === 1 && <Scene1 key="scene1" />}
        {step === 2 && <Scene2 key="scene2" />}
        {step === 3 && <FinalReveal key="final" />}
      </AnimatePresence>

      {/* Scroll Hint */}
      {step === 0 && (
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 text-xs tracking-[4px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          SCROLL TO BEGIN
        </motion.div>
      )}
    </div>
  );
}

/* ─── Scenes ───────────────────────────────────── */

function LogoScene() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, filter: 'blur(12px)' }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
    >
      <Image src="/logo/blues-logo.png" width={220} height={220} alt="logo" />
    </motion.div>
  );
}

function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0, y: 50, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -50, filter: 'blur(12px)' }}
      transition={{ duration: 0.9 }}
    >
      {SCENE_1.map((text, i) => (
        <motion.p
          key={i}
          className="text-white text-center uppercase tracking-[0.12em] my-2 text-sm sm:text-base"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.18 }}
        >
          {text}
        </motion.p>
      ))}
    </motion.div>
  );
}

function Scene2() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0, y: 50, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -50, filter: 'blur(12px)' }}
      transition={{ duration: 0.9 }}
    >
      {SCENE_2.map((text, i) => (
        <motion.p
          key={i}
          className="text-white text-center uppercase tracking-[0.14em] my-2 text-sm sm:text-base"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.18 }}
        >
          {text}
        </motion.p>
      ))}
    </motion.div>
  );
}

function FinalReveal() {
  return (
    <motion.div
      className="absolute inset-0 bg-white z-[20]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
}