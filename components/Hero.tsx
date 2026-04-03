"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";
import BagViewer from "@/components/Bag";
import LightRays from "@/components/Reusable/LightRays";
import Particles from "@/components/Reusable/Particles";
import IntroScreen from "@/components/IntroScreen";
import PageLoader from "@/components/PageLoader";
import MusicButton from "@/components/Reusable/MusicButton";
import Link from "next/link";
import { useAudio } from "@/hooks/useAudio";
import { useGLTF } from "@react-three/drei";

// Kick off model download immediately — before the Canvas even mounts
useGLTF.preload("/model/axis17.glb");

const INTRO_KEY = "bb_intro_seen";

const LIGHT_RAYS_PROPS = {
  raysOrigin: "top-center" as const,
  raysColor: "#ffffff",
  raysSpeed: 0.5,
  lightSpread: 1.5,
  rayLength: 4,
  followMouse: true,
  mouseInfluence: 0.1,
  pulsating: true,
  fadeDistance: 2,
};

/* ─── Shared easing ─── */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* ─── Per-element animation variants ─── */

// The whole hero fades up from a very slight scale
const heroVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.08,
    filter: "brightness(1.6) blur(12px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "brightness(1) blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
// Headline: each word-group slides up + blur clears
const headlineVariants = {
  hidden: { opacity: 0, y: 36, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

// Thin horizontal rule that grows from left
const ruleVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 0.25,
    transition: { duration: 0.7, ease: EASE_OUT, delay: 0.55 },
  },
};

// Bottom-right copy block
const copyVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.65 } },
};

const copyChildVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE_OUT },
  },
};

// Badge / pill at top of headline
const badgeVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 0.4,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT, delay: 0.1 },
  },
};

const Hero = () => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState<boolean | null>(null);
  // Controls when hero in-animation fires
  const [heroVisible, setHeroVisible] = useState(false);
  const [lockScroll, setLockScroll] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  const { playing, toggle, play, pause, playTap } = useAudio();

  const handleModelLoaded = () => {
    setModelLoaded(true);
    const seen = sessionStorage.getItem(INTRO_KEY);
    setShowIntro(!seen);
    play();
    if (seen) {
      setHeroVisible(true);
      // Unlock scroll 1 s after hero reveal (no intro path)
      setTimeout(() => setLockScroll(false), 1000);
    }
  };

  const handleIntroDone = () => {
    sessionStorage.setItem(INTRO_KEY, "1");

    window.scrollTo({ top: 0, behavior: "instant" });

    // Make hero visible BEFORE removing intro overlay so there's no white flash
    setHeroVisible(true);
    setShowIntro(false);
    play();

    // Unlock scroll 1 s after hero reveal
    setTimeout(() => {
      setLockScroll(false);
    }, 1000);
  };

  // Pause music automatically when hero scrolls out of view
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting) pause(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pause]);

  useEffect(() => {
    if (lockScroll) {
      // position:fixed is required for iOS Safari — overflow:hidden alone doesn't block scroll
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = "0";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, 0);
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  // showIntro dep ensures we re-apply the lock after IntroScreen unmounts and clears overflow
  }, [lockScroll, showIntro]);

  return (
    <>
      {/* Full-page loader — visible until GLB is fully downloaded */}
      {!modelLoaded && <PageLoader onLoaded={handleModelLoaded} />}

      {showIntro && (
        <IntroScreen
          onDone={handleIntroDone}
          LightRaysComponent={LightRays}
          lightRaysProps={LIGHT_RAYS_PROPS}
        />
      )}

      {/* ── Hero ── */}
      <motion.div
        ref={heroRef}
        className="relative w-full h-dvh overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,_#2a3f5f_0%,_#162035_35%,_#0a1220_65%,_#060c18_100%)]"
        variants={heroVariants}
        initial="hidden"
        animate={heroVisible ? "visible" : "hidden"}
        // Keep invisible (not display:none) while intro plays so 3D scene loads
        style={{ visibility: showIntro ? "hidden" : "visible" }}
      >
        {/* Light rays */}
        <LightRays className="absolute inset-0 z-[1]" {...LIGHT_RAYS_PROPS} />

        {/* Particles */}
        <div className="absolute inset-0 z-[2]">
          <Particles
            particleColors={["#ffffff"]}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={false}
            alphaParticles={true}
            disableRotation={true}
            pixelRatio={1}
          />
        </div>

        {/* 3D bag */}
        <main className="absolute inset-0 z-40 overflow-hidden w-full h-dvh">
          <BagViewer modelPath="/model/axis17.glb" />
        </main>

        {/* ── Copy overlay ── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top-left — headline */}
          <div className="absolute top-[18%] md:top-[13%] left-0 right-0 md:left-[2%] md:right-auto text-center md:text-left px-4 md:px-0 text-white uppercase">
            {/* Headline line 1 */}
            <motion.div
              variants={headlineVariants}
              initial="hidden"
              animate={heroVisible ? "visible" : "hidden"}
              transition={{ delay: 0.18 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight leading-[0.9] tracking-tight">
                timeless
              </h1>
            </motion.div>

            {/* Headline line 2 */}
            <motion.div
              variants={headlineVariants}
              initial="hidden"
              animate={heroVisible ? "visible" : "hidden"}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium leading-[0.9] tracking-tight">
                design legacy
              </h1>
            </motion.div>

            {/* Rule */}
            {/* <motion.div
              className="mt-5 w-24 h-px bg-white origin-left"
              variants={ruleVariants}
              initial="hidden"
              animate={heroVisible ? 'visible' : 'hidden'}
            /> */}
          </div>

          {/* Bottom-right — body copy + CTA */}
          <motion.div
            className="absolute bottom-[20%] md:bottom-[4%] left-0 right-0 md:left-auto md:right-[2%] flex flex-col items-center md:items-end gap-4 md:gap-5 pointer-events-auto z-40 px-4 md:px-0"
            variants={copyVariants}
            initial="hidden"
            animate={heroVisible ? "visible" : "hidden"}
          >
            {/* Body */}
            <motion.p
              className=" hidden md:block text-[9px] md:text-xs text-white/55 font-light leading-relaxed text-center md:text-right uppercase max-w-xs"
              variants={copyChildVariants}
            >
              A quiet luxury leather goods brand rooted in Italian design
              heritage and crafted through Indian artistry. Where form follows
              meaning, and every detail serves a reason.
            </motion.p>

            {/* CTA */}
            <motion.div variants={copyChildVariants}>
              <Link
                href="#"
                onClick={() => playTap()}
                className="inline-block cursor-pointer px-7 py-2.5 border border-white/60 text-[10px] tracking-[3px] uppercase text-white/80 hover:bg-white hover:text-black transition-colors duration-300"
              >
                Shop Now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Music button — outside motion.div so CSS transform doesn't trap fixed position */}
      {modelLoaded && (
        <MusicButton playing={playing} onToggle={() => { playTap(); toggle(); }} />
      )}
    </>
  );
};

export default Hero;
