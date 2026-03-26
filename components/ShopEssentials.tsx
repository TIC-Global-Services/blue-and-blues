"use client"
import { useState, useRef } from 'react'
import EssentialCard from './Product/EssentialCard'
import { useAudio } from '@/hooks/AudioContext'

const products = [
  {
    title: "The Axis Folio Bag",
    price: "11999",
    url: "https://shop.blueandblues.com/products/the-axis-laptop-bag",
    imgUrl: "/products/axis-folio-bag.webp",
  },
  {
    title: "The Ace'16 Case",
    price: "8200",
    url: "https://shop.blueandblues.com/products/the-ace-laptop-case-16",
    imgUrl: "/products/ace-16-case.webp",
  },
  {
    title: "The Core Tech Organizer",
    price: "6500",
    url: "https://shop.blueandblues.com/products/the-core-tech-organizer",
    imgUrl: "/products/bolt-tech-organiser.jpg",
  },
  {
    title: "Trifold Portable Desk Mat",
    price: "8999",
    url: "https://shop.blueandblues.com/products/trifold-portable-desk-mat",
    imgUrl: "/products/trifold-desk-mat.webp",
  },
  {
    title: "The Pulse Laptop Bag",
    price: "10999",
    url: "https://shop.blueandblues.com/products/the-pulse-laptop-bag",
    imgUrl: "/products/pulse-laptop.webp",
  },
]

const ShopEssentials = () => {
  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const {playHover, playTap} = useAudio();

  const scrollToIndex = (idx: number) => {
    if (!trackRef.current) return
    const cards = Array.from(trackRef.current.children) as HTMLElement[]
    const card = cards[idx]
    if (!card) return
    const containerRect = trackRef.current.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const scrollTarget = trackRef.current.scrollLeft + cardRect.left - containerRect.left
    trackRef.current.scrollTo({ left: scrollTarget, behavior: 'smooth' })
    setActive(idx)
  }

  const handleScroll = () => {
    if (!trackRef.current) return
    const { scrollLeft } = trackRef.current
    const cards = Array.from(trackRef.current.children) as HTMLElement[]
    let closest = 0
    let minDist = Infinity
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - scrollLeft)
      if (dist < minDist) {
        minDist = dist
        closest = i
      }
    })
    setActive(closest)
  }

  return (
    <section data-light-bg className="py-16 px-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <h2 className="font-medium text-primary text-4xl md:text-5xl uppercase leading-tight">
          Shop Our Essentials
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => { scrollToIndex(Math.max(0, active - 1)); playTap(); }}
            disabled={active === 0}
            aria-label="Previous"
            className="w-10 h-10 rounded-full border border-primary/40 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-25 disabled:pointer-events-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={() => { scrollToIndex(Math.min(products.length - 1, active + 1)); playTap(); }}
            disabled={active === products.length - 1}
            aria-label="Next"
            className="w-10 h-10 rounded-full border border-primary/40 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-25 disabled:pointer-events-none"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-scroll snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, idx) => (
          <div
            key={idx}
            onMouseEnter={playHover}
            className="shrink-0 w-[78%] sm:w-[44%] lg:w-[30%] snap-start"
          >
            <EssentialCard
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
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
              idx === active
                ? 'w-8 bg-primary'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default ShopEssentials
