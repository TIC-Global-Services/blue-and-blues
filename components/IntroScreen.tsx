'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';

interface IntroScreenProps {
  onDone: () => void;
  LightRaysComponent: React.ComponentType<any>;
  lightRaysProps: Record<string, any>;
}

/* ─── Copy ──────────────────────────────────────────────────────────────── */
const SCENE_1 = [
  { text: 'As you pursue your Purpose,',                   size: 'small' },
  { text: 'EVERY MOMENT COUNTS.',                          size: 'large' },
  { text: 'You need fewer distractions. Fewer decisions.', size: 'small' },
  { text: 'Just quiet certainty & confidence.',            size: 'small' },
];
const SCENE_2 = [
  { text: 'Blue & Blues.',                                        size: 'hero'  },
  { text: 'Crafted in the tradition of Italian design heritage.', size: 'small' },
  { text: 'Made real through Indian artistry.',                   size: 'small' },
  { text: 'Where form follows meaning,',                          size: 'xs'    },
  { text: 'and every detail serves a reason.',                    size: 'xs'    },
];

/* ─── Thresholds ────────────────────────────────────────────────────────── */
const T = {
  logoOut:   180,
  scene1In:  360,
  scene1Out: 640,
  scene2In:  820,
  scene2Out: 1080, // ← full scene2Out fires glow
  autoFire:  920,  // ← 85% through: if user scrolls back from here, still auto-fire
};

type Stage = 'logo' | 'logo-out' | 'scene1' | 'scene1-out' | 'scene2' | 'glow' | 'done';

/* ─── Glow layer (subscribes to MotionValue for sizing) ─────────────────── */
function GlowBurst({ progress }: { progress: ReturnType<typeof useMotionValue<number>> }) {
  const [size, setSize]    = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [halo, setHalo]    = useState(0);

  useEffect(() => {
    const unsub = progress.on('change', (v) => {
      // Main burst: 0→320vmax, eased-in square
      setSize(Math.pow(Math.max(0, v), 0.65) * 320);
      // Opacity: visible from v>0.05, full by v=0.25
      setOpacity(Math.min(1, Math.max(0, (v - 0.05) / 0.20)));
      // Halo: peaks at v=0.4, gone by v=0.9 (precedes the burst)
      setHalo(v < 0.4
        ? Math.min(1, v / 0.25)
        : Math.max(0, 1 - (v - 0.4) / 0.5));
    });
    return unsub;
  }, [progress]);

  return (
    <>
      {/* Soft blue-white halo — "charging" effect before the burst */}
      <div
        className="absolute rounded-full pointer-events-none z-[18]"
        style={{
          width:     '110vmax',
          height:    '110vmax',
          top:       '50%',
          left:      '50%',
          transform: `translate(-50%, -50%) scale(${0.3 + halo * 0.85})`,
          opacity:   halo * 0.7,
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(190,220,255,0.22) 0%, rgba(150,190,255,0.10) 45%, transparent 75%)',
          transition: 'opacity 60ms linear, transform 60ms linear',
        }}
      />

      {/* Main white burst */}
      <div
        className="absolute rounded-full pointer-events-none z-[19]"
        style={{
          width:     `${size}vmax`,
          height:    `${size}vmax`,
          top:       '50%',
          left:      '50%',
          transform: 'translate(-50%, -50%)',
          opacity,
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, #ffffff 0%, rgba(255,255,255,0.97) 18%, rgba(255,255,255,0.82) 38%, rgba(255,255,255,0.40) 60%, rgba(255,255,255,0.08) 80%, transparent 95%)',
        }}
      />

      {/* Screen-fill solid white at peak — ensures complete whiteout */}
      <div
        className="absolute inset-0 pointer-events-none z-[20] bg-white"
        style={{ opacity: Math.max(0, (opacity - 0.95) * 20) }} // only last 5% of opacity
      />
    </>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function IntroScreen({ onDone, LightRaysComponent, lightRaysProps }: IntroScreenProps) {
  const [stage, setStage]             = useState<Stage>('logo');
  const [hintVisible, setHintVisible] = useState(false);
  const [exiting, setExiting]         = useState(false);

  const glowProgress = useMotionValue(0); // drives GlowBurst

  const accumulated = useRef(0);
  const committed   = useRef(false);
  const glowFired   = useRef(false);
  const rafRef      = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setHintVisible(true), 900);
    return () => clearTimeout(t);
  }, []);

  /* ── Two-phase glow animation, fires automatically ── */
  const fireGlow = useCallback(() => {
    if (glowFired.current) return;
    glowFired.current = true;
    setStage('glow');

    // Phase 1 — slow charge: 0 → 0.4 in 800ms (halo blooms)
    animate(glowProgress, 0.4, {
      duration: 0.8,
      ease: [0.4, 0, 0.8, 0.6],
      onComplete: () => {
        // Tiny pause (imperceptible but lets halo peak register)
        setTimeout(() => {
          // Phase 2 — burst: 0.4 → 1 in 550ms (white fills screen)
          animate(glowProgress, 1, {
            duration: 0.55,
            ease: [0.15, 0, 0.3, 1],
            onComplete: () => {
              if (committed.current) return;
              committed.current = true;
              setStage('done');
              setTimeout(() => {
                setExiting(true);
                setTimeout(() => onDone(), 620);
              }, 160);
            },
          });
        }, 80);
      },
    });
  }, [glowProgress, onDone]);

  /* ── Scroll delta → stage ── */
  const processDelta = useCallback((delta: number) => {
    if (committed.current || glowFired.current) return;

    // Signed delta: forward scroll adds, back scroll subtracts
    // Clamp 0 → scene2Out so user can reverse through all scenes
    accumulated.current = Math.min(
      T.scene2Out,
      Math.max(0, accumulated.current + delta)
    );
    const acc = accumulated.current;

    // Auto-fire zone: once user has reached 85% of the journey,
    // fire the glow automatically even if they start scrolling back
    if (acc >= T.autoFire) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setStage('scene2');
        fireGlow();
      });
      return;
    }

    let next: Stage = 'logo';
    if      (acc >= T.scene2Out) next = 'scene2';
    else if (acc >= T.scene2In)  next = 'scene2';
    else if (acc >= T.scene1Out) next = 'scene1-out';
    else if (acc >= T.scene1In)  next = 'scene1';
    else if (acc >= T.logoOut)   next = 'logo-out';

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setStage(next);
    });
  }, [fireGlow]);

  useEffect(() => {
    const onWheel      = (e: WheelEvent) => processDelta(e.deltaY);   // signed: + = down, - = up
    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      // Swipe up = positive delta (forward), swipe down = negative (back)
      const dy = touchStartY.current - e.touches[0].clientY;
      touchStartY.current = e.touches[0].clientY;
      processDelta(dy);
    };
    const onKey = (e: KeyboardEvent) => {
      // Positive = forward, negative = back
      const map: Record<string, number> = {
        ArrowDown:  60,
        ArrowUp:   -60,
        Space:      120,
        PageDown:   200,
        PageUp:    -200,
      };
      if (map[e.code] !== undefined) processDelta(map[e.code]);
    };

    window.addEventListener('wheel',      onWheel,      { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: true });
    window.addEventListener('keydown',    onKey);
    return () => {
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('keydown',    onKey);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [processDelta]);

  const showLogo    = stage === 'logo';
  const showScene1  = stage === 'scene1';
  const showScene2  = stage === 'scene2' && !glowFired.current;
  // Progress bar: 0→100% as user moves from 0 to autoFire threshold
  const progressPct = Math.min(100, (accumulated.current / T.autoFire) * 100);

  return (
    <motion.div
      className="fixed inset-0 z-[9998] overflow-hidden"
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.62, ease: 'easeInOut' }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, #2a3f5f 0%, #162035 35%, #0a1220 65%, #060c18 100%)',
        }}
      />

      {/* Light rays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <LightRaysComponent {...lightRaysProps} className="absolute inset-0" />
      </div>

      {/* ── Logo ── */}
      <AnimatePresence>
        {showLogo && (
          <motion.div
            key="logo"
            className="absolute top-[25%] left-1/2 -translate-x-1/2 z-[5] flex items-center justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -28, filter: 'blur(6px)' }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src="/logo/blues-logo.png" alt="Blue & Blues" width={200} height={200} priority />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scene 1 ── */}
      <AnimatePresence>
        {showScene1 && (
          <motion.div
            key="scene1"
            className="absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 gap-0"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden:  {},
              visible: { transition: { staggerChildren: 0.11 } },
              exit:    { transition: { staggerChildren: 0.065, staggerDirection: 1 } },
            }}
          >
            {SCENE_1.map((line, i) => (
              <motion.p
                key={i}
                className={[
                  'text-center text-white leading-snug uppercase',
                  line.size === 'large'
                    ? 'text-2xl sm:text-3xl md:text-[2.6rem] font-semibold tracking-[0.12em] my-3'
                    : 'text-sm sm:text-[0.95rem] text-white/50 font-light tracking-widest mt-2',
                ].join(' ')}
                variants={{
                  hidden:  { opacity: 0, y: 24, filter: 'blur(4px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                  exit:    { opacity: 0, y: -20, filter: 'blur(4px)', transition: { duration: 0.42, ease: [0.4, 0, 1, 1] } },
                }}
              >
                {line.text}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scene 2 ── */}
      <AnimatePresence>
        {showScene2 && (
          <motion.div
            key="scene2"
            className="absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 gap-0"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden:  {},
              visible: { transition: { staggerChildren: 0.1 } },
              exit:    { transition: { staggerChildren: 0.055 } },
            }}
          >
            {SCENE_2.map((line, i) => (
              <motion.p
                key={i}
                className={[
                  'text-center text-white leading-snug uppercase',
                  line.size === 'hero'
                    ? 'text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.2em] mb-6'
                    : line.size === 'small'
                    ? 'text-sm sm:text-[0.95rem] text-white/50 font-light tracking-widest mt-1'
                    : 'text-xs text-white/30 font-light tracking-widest mt-3',
                ].join(' ')}
                variants={{
                  hidden:  { opacity: 0, y: 20, filter: 'blur(4px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
                  exit:    { opacity: 0, y: -16, filter: 'blur(4px)', transition: { duration: 0.38, ease: [0.4, 0, 1, 1] } },
                }}
              >
                {line.text}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Glow layers (state-subscribed, not motion-value bound) ── */}
      <GlowBurst progress={glowProgress} />

      {/* ── Scroll hint ── */}
      <AnimatePresence>
        {hintVisible && stage === 'logo' && (
          <motion.div
            key="hint"
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[6] flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
           
            <p className="text-[9px] tracking-[4px] uppercase text-white/25">
              Scroll to begin
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-[7] h-px bg-white/[0.06]">
        <div
          className="h-full bg-white/20 origin-left transition-none"
          style={{ transform: `scaleX(${progressPct / 100})`, transformOrigin: 'left' }}
        />
      </div>
    </motion.div>
  );
}