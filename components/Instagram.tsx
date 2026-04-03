"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const POSTS = [
  { src: "/gram/1.mp4", left: "18%", top: "8%",  w: 180 },
  { src: "/gram/2.mp4", left: "55%", top: "16%",  w: 250 },
  { src: "/gram/4.mp4", left: "14%", top: "62%", w: 275 },
  { src: "/gram/3.mp4", left: "68%", top: "55%", w: 180 },
  { src: "/gram/5.mp4", left: "2%",  top: "32%", w: 175 },
  { src: "/gram/6.mp4", left: "72%", top: "28%", w: 300 },
  { src: "/gram/7.mp4", left: "32%", top: "60%", w: 160 },
  { src: "/gram/8.mp4", left: "44%", top: "4%",  w: 165 },
]

// Breakpoint below which we scale down post sizes
const MOBILE_BP = 768
const MOBILE_CANVAS = 520 // treat this as the "design width" for mobile scaling

const WAVE_SIZE   = 4    // posts per wave
const INITIAL_GAP = 0.8  // pause before first wave so it appears after scroll starts
const WAVE_GAP    = 2.0  // scroll time between waves
const ENTER_DUR   = 0.4
const HOLD_DUR    = 0.6
const EXIT_DUR    = 0.8
const IN_STAGGER  = 0.06

export default function Instagram() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const itemsRef   = useRef<(HTMLDivElement | null)[]>([])
  const [postScale, setPostScale] = useState(1)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setPostScale(w < MOBILE_BP ? w / MOBILE_CANVAS : 1)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const items = itemsRef.current.filter(Boolean) as HTMLDivElement[]
    if (!section || !items.length) return

    gsap.set(items, { opacity: 0, scale: 1, filter: "blur(0px)" })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start:   "top top",
        end:     "bottom bottom",
        scrub:   2,
      },
    })

    // Small pause at the start so the first wave isn't already visible on enter
    tl.to({}, { duration: INITIAL_GAP })

    // Split into waves and animate each wave as a group
    const totalWaves = Math.ceil(items.length / WAVE_SIZE)

    for (let w = 0; w < totalWaves; w++) {
      const wave = items.slice(w * WAVE_SIZE, w * WAVE_SIZE + WAVE_SIZE)
      const t = INITIAL_GAP + w * WAVE_GAP

      // All appear together (tiny internal stagger)
      wave.forEach((item, j) => {
        tl.fromTo(
          item,
          { opacity: 0, scale: 1.06, filter: "blur(6px)" },
          { opacity: 1, scale: 1,    filter: "blur(0px)", duration: ENTER_DUR, ease: "power2.out" },
          t + j * IN_STAGGER
        )
      })

      // Hold
      tl.to({}, { duration: HOLD_DUR }, t + ENTER_DUR + wave.length * IN_STAGGER)

      // All go deep together
      wave.forEach((item, j) => {
        tl.to(
          item,
          { opacity: 0, scale: 0.05, filter: "blur(8px)", duration: EXIT_DUR, ease: "power3.in" },
          t + ENTER_DUR + wave.length * IN_STAGGER + HOLD_DUR + j * IN_STAGGER
        )
      })
    }

    return () => ScrollTrigger.getAll().forEach(st => st.kill())
  }, [])

  return (
    <section ref={sectionRef} data-light-bg className="relative h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Center text — always on top */}
        <div className="absolute inset-0 flex flex-col items-center gap-3 justify-center z-20 pointer-events-none px-4">
          <p className="uppercase text-primary font-medium text-base md:text-2xl tracking-[0.12em] md:tracking-[0.25em]">
            Seen on the <span className="text-slate-400">'Gram</span>
          </p>
          <h2 className="text-2xl md:text-6xl font-medium text-center break-all md:break-normal">
            @blueandblues.official
          </h2>
        </div>

        {/* Posts */}
        {POSTS.map((post, i) => (
          <div
            key={i}
            ref={el => { itemsRef.current[i] = el }}
            className="absolute rounded-2xl overflow-hidden shadow-xl z-10"
            style={{ left: post.left, top: post.top, width: Math.round(post.w * postScale) }}
          >
            <video
              src={post.src}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto block"
            />
          </div>
        ))}

      </div>
    </section>
  )
}
