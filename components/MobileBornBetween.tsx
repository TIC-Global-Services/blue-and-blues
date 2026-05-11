"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import HoverImageLink from "./Reusable/HoverImageLink";

const MobileBornBetween = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      // MAIN IMAGE — from fullscreen → 9:16
      tl.fromTo(
        mainRef.current,
        { height: "70vh", borderRadius: "0px" },
        { height: "56.25vh", borderRadius: "16px", duration: 1, ease: "power2.inOut" },
        0
      );

      // TOP slides DOWN
      tl.fromTo(
        topRef.current,
        { y: "-100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.8, ease: "power3.out" },
        0.5
      );

      // BOTTOM slides UP
      tl.fromTo(
        bottomRef.current,
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.8, ease: "power3.out" },
        0.5
      );

      // TEXT reveal
      tl.fromTo(
        textRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        1.0
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="block md:hidden bg-white">
      <div className="h-screen px-4 py-6 overflow-hidden flex flex-col justify-center">

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
            <HoverImageLink src="/Home/left_top.jpg" alt="" href="https://shop.blueandblues.com/collections/laptop-bags" staticBtn label="View Laptop Bags" />
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            <HoverImageLink src="/Home/right_top.jpg" alt="" href="https://shop.blueandblues.com/collections/organizers" staticBtn label="View Organizers" />
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
            href="https://shop.blueandblues.com/collections/backpacks"
            staticBtn
            label="View Backpacks"
          />
        </div>

        {/* BOTTOM ROW */}
        <div ref={bottomRef} className="grid grid-cols-2 gap-4 opacity-0">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            <HoverImageLink src="/Home/left_bottom.jpg" alt="" href="https://shop.blueandblues.com/collections/magsafe-wallets" staticBtn label="View Wallets" />
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden ">
            <HoverImageLink src="/Home/right_bottom.jpg" alt="" href="https://shop.blueandblues.com/collections/laptop-bags" label="View Laptop Bags" staticBtn className=" object-[20%_40%]"  />
          </div>
        </div>

      </div>
    </section>
  );
};

export default MobileBornBetween;