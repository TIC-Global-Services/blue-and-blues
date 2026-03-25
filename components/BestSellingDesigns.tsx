"use client";

import { useRef, useState } from "react";
import BestSellingCard from "./Product/BestSellingCard";

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
    setActive(idx);
  };

  const handleScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft } = trackRef.current;
    const cards = Array.from(trackRef.current.children) as HTMLElement[];
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - scrollLeft);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActive(closest);
  };

  return (
    <section className="py-16 px-6">
      <h2 className="font-medium text-primary text-4xl md:text-5xl uppercase mb-10 text-center">
        Handpicked Best Selling Designs
      </h2>

      {/* Carousel track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-scroll snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden  overflow-y-hidden pt-10"
      >
        {bestProducts.map((product, idx) => (
          <div key={idx} className="shrink-0 w-[60%] sm:w-[38%] lg:w-[22%] h-auto snap-start">
            <BestSellingCard
              title={product.title}
              imgUrl={product.imgUrl}
              url={product.url}
              price={product.price}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center items-center gap-2 mt-8">
        {bestProducts.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
              idx === active
                ? "w-8 bg-primary"
                : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default BestSellingDesigns;
