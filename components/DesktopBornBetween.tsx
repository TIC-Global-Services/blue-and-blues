"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverImageLink from "./Reusable/HoverImageLink";

gsap.registerPlugin(ScrollTrigger);

const DesktopBornBetween = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mainFrameRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLParagraphElement>(null);
  const rightTextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });

      // Phase 1: shrink main frame
      tl.to(
        mainFrameRef.current,
        {
          width: "40%",
          height: "80%",
          left: "30%",
          top: "10%",
          duration: 1,
          ease: "none",
        },
        0
      );

      tl.to(
        mainFrameRef.current!.querySelector("img"),
        {
          objectPosition: "60% center",
          duration: 1,
          ease: "none",
        },
        0
      );

      // Phase 2: side panels
      tl.fromTo(
        leftPanelRef.current,
        { x: "-100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 1, ease: "power3.out" },
        1
      );

      tl.fromTo(
        rightPanelRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 1, ease: "power3.out" },
        1
      );

      // Phase 3: text
      tl.fromTo(
        leftTextRef.current,
        { y: "-30px", opacity: 0 },
        { y: "0px", opacity: 1, duration: 0.6 },
        2.1
      );

      tl.fromTo(
        rightTextRef.current,
        { y: "30px", opacity: 0 },
        { y: "0px", opacity: 1, duration: 0.6 },
        1.8
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="hidden md:block h-[300vh] p-5">
      <div className="sticky top-0 h-screen overflow-hidden bg-white">

        {/* LEFT PANEL */}
        <div
          ref={leftPanelRef}
          className="absolute top-0 left-0 w-[30%] h-[90%] opacity-0 z-[1] flex flex-col items-end py-5 gap-3"
        >
          <div className="relative rounded-2xl overflow-hidden w-full" style={{ flex: "6 1 0" }}>
            <HoverImageLink
              src="/Home/left_top.jpg"
              alt="left top"
              href="#"
            />
          </div>

          <div className="relative rounded-2xl overflow-hidden w-[80%]" style={{ flex: "4 1 0" }}>
            <HoverImageLink
              src="/Home/left_bottom.jpg"
              alt="left bottom"
              href="#"
            />
          </div>

          <p
            ref={leftTextRef}
            className="uppercase font-medium leading-[1.05] text-[clamp(2.5rem,2.2vw,4.5rem)] text-primary text-right opacity-0"
          >
            INTENTION<br />& FORM
          </p>
        </div>

        {/* MAIN FRAME */}
        <div
          ref={mainFrameRef}
          className="absolute top-0 left-0 w-full h-full z-[2] p-5"
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <HoverImageLink
              src="/Home/main_frame.png"
              alt="main"
              href="#"
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          ref={rightPanelRef}
          className="absolute bottom-0 right-0 w-[30%] h-[90%] opacity-0 z-[1] flex flex-col gap-3 py-5"
        >
          <p
            ref={rightTextRef}
            className="uppercase font-medium leading-[1.05] text-[clamp(3rem,3vw,5rem)] text-primary opacity-0"
          >
            BORN<br />BETWEEN
          </p>

          <div className="relative rounded-2xl overflow-hidden w-[80%]" style={{ flex: "4 1 0" }}>
            <HoverImageLink
              src="/Home/right_top.jpg"
              alt="right top"
              href="#"
            />
          </div>

          <div className="relative rounded-2xl overflow-hidden" style={{ flex: "6 1 0" }}>
            <HoverImageLink
              src="/Home/right_bottom.jpg"
              alt="right bottom"
              href="#"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesktopBornBetween;