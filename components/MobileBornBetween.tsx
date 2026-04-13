"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverImageLink from "./Reusable/HoverImageLink";

gsap.registerPlugin(ScrollTrigger);

const MobileBornBetween = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      // 🔥 Phase 1: MAIN IMAGE — from fullscreen → 9:16
      tl.fromTo(
        mainRef.current,
        {
          width: "100%",
          height: "70vh", // 👈 larger than 9:16 initially
          borderRadius: "0px",
        },
        {
          width: "100%",
          height: "56.25vh", // 👈 approx 9:16 feel
          borderRadius: "16px",
          duration: 1,
          ease: "none",
        },
        0
      );

      // 👉 TOP slides DOWN
      tl.fromTo(
        topRef.current,
        {
          y: "-100%",
          opacity: 0,
        },
        {
          y: "0%",
          opacity: 1,
          duration: 1,
          ease: "power3.out",
        },
        0.6
      );

      // 👉 BOTTOM slides UP
      tl.fromTo(
        bottomRef.current,
        {
          y: "100%",
          opacity: 0,
        },
        {
          y: "0%",
          opacity: 1,
          duration: 1,
          ease: "power3.out",
        },
        0.6
      );

      // 👉 TEXT reveal
      tl.fromTo(
        textRef.current,
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        },
        1.2
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="block md:hidden h-[220vh] bg-white">
      <div className="sticky top-0 h-screen px-4 py-6 overflow-hidden flex flex-col justify-center">

        {/* TEXT */}
        <div ref={textRef} className="text-center mb-6 opacity-0">
          <h2 className="text-2xl font-medium uppercase leading-tight">
            Born Between
          </h2>
          <h2 className="text-2xl font-medium uppercase leading-tight">
            Intention & Form
          </h2>
        </div>

        {/* TOP ROW */}
        <div ref={topRef} className="grid grid-cols-2 gap-4 mb-4 opacity-0">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            <HoverImageLink src="/Home/left_top.jpg" alt="" href="#" staticBtn />
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            <HoverImageLink src="/Home/right_top.jpg" alt="" href="#" staticBtn />
          </div>
        </div>

        {/* 🔥 MAIN IMAGE */}
        <div
          ref={mainRef}
          className="relative w-full overflow-hidden mb-4"
          style={{ height: "70vh" }} // 👈 initial state
        >
          <HoverImageLink
            src="/Home/main_frame.png"
            alt=""
            href="#"
            staticBtn
          />
        </div>

        {/* BOTTOM ROW */}
        <div ref={bottomRef} className="grid grid-cols-2 gap-4 opacity-0">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            <HoverImageLink src="/Home/left_bottom.jpg" alt="" href="#" staticBtn />
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            <HoverImageLink src="/Home/right_bottom.jpg" alt="" href="#" staticBtn />
          </div>
        </div>

      </div>
    </section>
  );
};

export default MobileBornBetween;