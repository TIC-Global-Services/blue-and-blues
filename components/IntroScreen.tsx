"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

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
      gsap.set(
        [
          ".logo",
          ".scene1",
          ".scene2",
          ".light-expand",
          ".white-flash",
          ".scroll-hint",
        ],
        {
          force3D: true,
          willChange: "transform, opacity",
        }
      );

      const tl = gsap.timeline({ paused: true });
      timelineRef.current = tl;

      // TIMELINE (balanced for scroll)
      tl.to(".scroll-hint", { opacity: 0, duration: 0.3 }, 0);

      tl.to(".logo", { opacity: 0, scale: 0.9, duration: 0.3 }, 0.05);

      // Scene 1
      tl.to(".scene1", { opacity: 1, duration: 0.4 }, 0.1);

      tl.fromTo(
        ".scene1 .word",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 0.6,
          ease: "power3.out",
        },
        0.15
      );

      tl.to(".scene1", { opacity: 0, duration: 0.4 }, 0.45);

      // Scene 2
      tl.to(".scene2", { opacity: 1, duration: 0.4 }, 0.5);

      tl.fromTo(
        ".scene2 .word",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 0.6,
          ease: "power3.out",
        },
        0.55
      );

      tl.to(".scene2", { opacity: 0, duration: 0.4 }, 0.8);

      // Light blast
      tl.fromTo(
        ".light-expand",
        { scale: 1, opacity: 0.6 },
        {
          scale: 22,
          opacity: 1,
          duration: 1.8,
          ease: "power3.in",
        },
        0.85
      );

      tl.to(".white-flash", { opacity: 1, duration: 0.3 }, 0.9);

      tl.to(".white-flash", {
        opacity: 0,
        duration: 0.8,
        ease: "power1.out",
        onComplete: onDone,
      }, 0.95);
    }, containerRef);

    // ✅ SCROLL → TIMELINE
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);

      gsap.to(timelineRef.current, {
        progress,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      ctx.revert();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onDone]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,_#2a3f5f_0%,_#162035_35%,_#0a1220_65%,_#060c18_100%)]"
    >
      {/* LIGHT */}
      <div className="light-expand absolute inset-0 opacity-60">
        <LightRaysComponent {...lightRaysProps} />
      </div>

      {/* LOGO */}
      <div className="logo absolute inset-0 flex items-center justify-center">
        <Image src="/logo/blues-logo.png" width={220} height={220} alt="logo" />
      </div>

      {/* SCROLL HINT */}
      <div className="scroll-hint absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-[6px]">
        Scroll to begin
      </div>

      {/* SCENE 1 */}
      <div className="scene1 absolute inset-0 flex flex-col items-center justify-center px-6 opacity-0">
        {"A quiet legacy".split(" ").map((w, i) => (
          <span key={i} className="word text-white/40 uppercase text-xs tracking-[0.4em]">
            {w}
          </span>
        ))}
      </div>

      {/* SCENE 2 */}
      <div className="scene2 absolute inset-0 flex flex-col items-center justify-center px-6 opacity-0 gap-3">
        <p className="text-white/40 text-xs uppercase tracking-[0.4em]">
          {"Crafting pieces that evolve alongside you,".split(" ").map((w, i) => (
            <span key={i} className="word inline-block mr-2">
              {w}
            </span>
          ))}
        </p>

        <p className="text-white text-4xl sm:text-6xl font-bold mt-5 uppercase">
          {"BLUE & BLUES.".split(" ").map((word, i) => {
            if (word === "&") {
              return (
                <span key={i} className="word inline-block font-inter mx-2">
                  &
                </span>
              );
            }
            return (
              <span key={i} className="word inline-block mr-2">
                {word}
              </span>
            );
          })}
        </p>
      </div>

      {/* FLASH */}
      <div className="white-flash absolute inset-0 bg-white opacity-0" />
    </div>
  );
}