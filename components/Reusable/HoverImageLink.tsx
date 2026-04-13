"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import PrimaryBtn from "./PrimaryBtn";

const HoverImageLink = ({
  src,
  alt,
  href,
  label = "View Product",
  staticBtn = false,
}: {
  src: string;
  alt: string;
  href: string;
  label?: string;
  staticBtn?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (isMobile || staticBtn) return;

    const el = containerRef.current;
    const btn = btnRef.current;
    if (!el || !btn) return;

    const move = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(btn, {
        x: x - rect.width / 2,
        y: y - rect.height / 2,
        duration: 0.3,
        ease: "power3.out",
      });
    };

    const leave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: "power3.out",
      });
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);

    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [isMobile, staticBtn]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-full h-full cursor-pointer"
    >
      <div ref={containerRef} className="relative w-full h-full">
        {/* Image */}
        <Image
          src={src}
          fill
          alt={alt}
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/20 transition duration-300 ${
            isMobile || staticBtn
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        />

        {/* Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            ref={btnRef}
            className={
              isMobile || staticBtn
                ? "opacity-100 scale-100"
                : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out"
            }
          >
            <PrimaryBtn text={label} mode="dark" variant="primary" />
          </div>
        </div>
      </div>
    </a>
  );
};

export default HoverImageLink;