"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const INSTAGRAM_URL = "https://www.instagram.com/blueandblues.official/"

const POSTS = [
  { src: "/gram/1.mp4", left: "18%", top: "8%",  w: 180, link: "https://www.instagram.com/blueandblues.official/" },
  { src: "/gram/2.mp4", left: "55%", top: "16%", w: 250, link: "https://www.instagram.com/blueandblues.official/" },
  { src: "/gram/4.mp4", left: "14%", top: "62%", w: 275, link: "https://www.instagram.com/blueandblues.official/" },
  { src: "/gram/3.mp4", left: "68%", top: "55%", w: 180, link: "https://www.instagram.com/blueandblues.official/" },
  { src: "/gram/5.mp4", left: "2%",  top: "32%", w: 175, link: "https://www.instagram.com/blueandblues.official/" },
  { src: "/gram/6.mp4", left: "72%", top: "28%", w: 300, link: "https://www.instagram.com/blueandblues.official/" },
  { src: "/gram/7.mp4", left: "32%", top: "60%", w: 160, link: "https://www.instagram.com/blueandblues.official/" },
  { src: "/gram/8.mp4", left: "44%", top: "4%",  w: 165, link: "https://www.instagram.com/blueandblues.official/" },
]

const MOBILE_BP     = 768
const MOBILE_CANVAS = 520
const WAVE_SIZE     = 4
const INITIAL_GAP   = 0.8
const WAVE_GAP      = 2.0
const ENTER_DUR     = 0.4
const HOLD_DUR      = 0.6
const EXIT_DUR      = 0.6
const IN_STAGGER    = 0.06

export default function Instagram() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const itemsRef   = useRef<(HTMLDivElement | null)[]>([])
  const videosRef  = useRef<(HTMLVideoElement | null)[]>([])
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
    const items   = itemsRef.current.filter(Boolean) as HTMLDivElement[]
    const videos  = videosRef.current
    if (!section || !items.length) return

    // All start hidden, GPU-promoted, no decode pressure yet
    gsap.set(items, { opacity: 0, scale: 1, force3D: true })

    // Play/pause each video based on its current opacity — only visible ones decode
    const syncVideos = () => {
      items.forEach((item, i) => {
        const video = videos[i]
        if (!video) return
        const opacity = gsap.getProperty(item, "opacity") as number
        if (opacity > 0.05) {
          if (video.paused) video.play().catch(() => {})
        } else {
          if (!video.paused) video.pause()
        }
      })
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start:   "top top",
        end:     "bottom bottom",
        scrub:   1,
        onUpdate: syncVideos,
      },
    })

    tl.to({}, { duration: INITIAL_GAP })

    const totalWaves = Math.ceil(items.length / WAVE_SIZE)
    for (let w = 0; w < totalWaves; w++) {
      const wave = items.slice(w * WAVE_SIZE, w * WAVE_SIZE + WAVE_SIZE)
      const t    = INITIAL_GAP + w * WAVE_GAP

      wave.forEach((item, j) => {
        tl.fromTo(
          item,
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: ENTER_DUR, ease: "power2.out" },
          t + j * IN_STAGGER
        )
      })

      tl.to({}, { duration: HOLD_DUR }, t + ENTER_DUR + wave.length * IN_STAGGER)

      wave.forEach((item, j) => {
        tl.to(
          item,
          { opacity: 0, scale: 0.88, duration: EXIT_DUR, ease: "power2.in" },
          t + ENTER_DUR + wave.length * IN_STAGGER + HOLD_DUR + j * IN_STAGGER
        )
      })
    }

    return () => ScrollTrigger.getAll().forEach(st => st.kill())
  }, [])

  return (
    <section ref={sectionRef} data-light-bg className="relative h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center gap-3 justify-center z-20 pointer-events-none px-4">
          <p className="uppercase text-primary font-medium text-base md:text-2xl tracking-[0.12em] md:tracking-[0.25em]">
            Seen on the <span className="text-slate-400">'Gram</span>
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto text-2xl md:text-6xl font-medium text-center break-all md:break-normal hover:opacity-70 transition-opacity duration-200"
          >
            @blueandblues.official
          </a>
        </div>

        {/* Posts */}
        {POSTS.map((post, i) => (
          <div
            key={i}
            ref={el => { itemsRef.current[i] = el }}
            className="absolute rounded-2xl overflow-hidden shadow-xl z-10"
            style={{ left: post.left, top: post.top, width: Math.round(post.w * postScale) }}
          >
            <a href={post.link} target="_blank" rel="noopener noreferrer" className="block">
              <video
                ref={el => { videosRef.current[i] = el }}
                src={post.src}
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-auto block pointer-events-none"
              />
            </a>
          </div>
        ))}

      </div>
    </section>
  )
}
