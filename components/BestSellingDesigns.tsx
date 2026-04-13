"use client";

import { useEffect, useRef, useState } from "react";
import BestSellingCard from "./Product/BestSellingCard";
import { useAudio } from "@/hooks/AudioContext";

const bestProducts = [
  {
    title: "The Arch Backpack",
    price: "11999",
    url: "#",
    imgUrl: "/products/gray-backpack.jpg",
  },
  {
    title: "The Traveller Backpack",
    price: "16800",
    url: "#",
    imgUrl: "/products/traveller-backpack.jpg",
  },
  {
    title: "The Core Tech Organizer",
    price: "6500",
    url: "#",
    imgUrl: "/products/bolt-tech-organiser.jpg",
  },
  {
    title: "Core 5 Wallet",
    price: "4200",
    url: "#",
    imgUrl: "/products/core5-wallet2.jpg",
  },
  {
    title: "The Pulse Laptop Bag",
    price: "10999",
    url: "#",
    imgUrl: "/products/axis-folio-bag.webp",
  },
];

const BestSellingDesigns = () => {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const { playHover } = useAudio();

  // Auto slide for mobile stacked view
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % bestProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Sync active dot with desktop scroll position
  const handleScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, offsetWidth } = trackRef.current;
    const cards = Array.from(trackRef.current.children) as HTMLElement[];

    let closest = 0;
    let minDist = Infinity;

    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const containerCenter = scrollLeft + offsetWidth / 2;
      const dist = Math.abs(cardCenter - containerCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setActive(closest);
  };

  const scrollToIndex = (idx: number) => {
    if (!trackRef.current) return;
    const cards = Array.from(trackRef.current.children) as HTMLElement[];
    const card = cards[idx];
    if (!card) return;

    const containerRect = trackRef.current.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const scrollTarget =
      trackRef.current.scrollLeft + cardRect.left - containerRect.left;

    trackRef.current.scrollTo({ left: scrollTarget, behavior: "smooth" });
  };

  const handleDotClick = (idx: number) => {
    setActive(idx);
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      scrollToIndex(idx);
    }
  };

  return (
    <section data-light-bg className="py-16 px-4 md:px-6">
      <h2 className="font-medium text-primary text-3xl md:text-5xl uppercase md:mb-14 text-center">
        Handpicked Best Selling Designs
      </h2>

      {/* ================= MOBILE STACK ================= */}
      {/* -mx-4 cancels section px-4 so cards can reach the viewport edges */}
      <div className="md:hidden flex flex-col items-center -mx-4">
        {/* Stack wrapper */}
        <div className="relative w-full flex justify-center items-center h-115">
          {bestProducts.map((product, idx) => {
            const total = bestProducts.length;
            let offset = idx - active;
            // Normalize for infinite loop: wrap around the shortest path
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isActive = offset === 0;
            const isLeft = offset === -1;
            const isRight = offset === 1;
            const isHidden = Math.abs(offset) > 1;

            return (
              <div
                key={idx}
                onClick={() => !isActive && setActive(idx)}
                className={`
                  absolute transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                  ${isActive ? "z-30 scale-100 translate-x-0 translate-y-0 opacity-100" : ""}
                  ${isLeft ? "z-10 scale-[0.88] -translate-x-16 translate-y-0 opacity-50 cursor-pointer" : ""}
                  ${isRight ? "z-10 scale-[0.88] translate-x-16 translate-y-0 opacity-50 cursor-pointer" : ""}
                  ${isHidden ? "opacity-0 scale-75 pointer-events-none" : ""}
                `}
              >
                <div className="w-65">
                  <BestSellingCard {...product} showInfo={false} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Title + price for the active card */}
        <div className=" text-center">
          <h3 className="text-primary uppercase font-medium text-lg leading-tight">
            {bestProducts[active].title}
          </h3>
          <p className="text-black/80 text-base mt-1 font-medium">
            ₹{Number(bestProducts[active].price).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ================= DESKTOP SNAP SCROLL ================= */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="
          hidden md:flex gap-6 overflow-x-scroll snap-x snap-mandatory
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          pt-10
        "
      >
        {bestProducts.map((product, idx) => (
          <div
            key={idx}
            onMouseEnter={playHover}
            className="shrink-0 w-[38%] lg:w-[22%] snap-start"
          >
            <BestSellingCard {...product} showInfo={true} />
          </div>
        ))}
      </div>

      {/* ================= DOT INDICATORS (mobile + desktop) ================= */}
      <div className="flex justify-center items-center gap-2 mt-8">
        {bestProducts.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`
              h-2 rounded-full transition-all duration-300
              ${idx === active ? "w-8 bg-primary" : "w-2 bg-gray-300"}
            `}
          />
        ))}
      </div>
    </section>
  );
};

export default BestSellingDesigns;