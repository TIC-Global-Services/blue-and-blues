"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useSpring, useMotionValue } from "framer-motion"

/* ── Magnetic tilt card ─────────────────────────────────── */
const LogoCard = ({ src, alt, delay }: { src: string; alt: string; delay: number }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const scale   = useSpring(useMotionValue(1),  { stiffness: 200, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    rotateY.set(x * 12)
    rotateX.set(-y * 12)
    scale.set(1.04)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className="
        relative flex items-center justify-center
        bg-[#D1DDE5]/60 rounded-xl
        h-[110px] sm:h-[120px] md:h-[130px]
        cursor-pointer group overflow-hidden
        border border-white/40
        hover:shadow-[0_8px_32px_rgba(26,58,92,0.13)]
        transition-shadow duration-300
      "
    >
      {/* shimmer on hover */}
      <span className="
        pointer-events-none absolute inset-0
        bg-gradient-to-br from-white/30 via-transparent to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
      " />
      <div className="relative w-[40%] h-[55%]">
        <Image src={src} alt={alt} fill className="object-contain" />
      </div>
    </motion.div>
  )
}

/* ── Label ──────────────────────────────────────────────── */
const Label = ({
  children,
  color,
  delay,
  fromX,
}: {
  children: React.ReactNode
  color: string
  delay: number
  fromX: number
}) => (
  <motion.div
    initial={{ opacity: 0, x: fromX }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className="flex items-center justify-center h-[110px] sm:h-[120px] md:h-[130px]"
  >
    <h2
      className="uppercase font-medium leading-[1.05] tracking-[0.01em] text-[clamp(1.6rem,2.5vw,2.4rem)] whitespace-nowrap"
      style={{ color }}
    >
      {children}
    </h2>
  </motion.div>
)

/* ── Main section ───────────────────────────────────────── */
const InTheSpotlight = () => {
  return (
    <section className="relative w-full py-16 md:py-24 px-5 sm:px-8 md:px-12 lg:px-20 bg-white">
      {/*
        Layout:
        Mobile  (< md): 2 columns
        Desktop (≥ md): 4 columns
        
        Row 1: Vogue | IN THE SPOTLIGHT | Elle   | Grazia
        Row 2: Femina | Cosmopolitan    | TimeLife | WHERE IT COUNTS
      */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Row 1 */}
        <LogoCard src="/logos/vogue.png"  alt="Vogue"  delay={0.05} />

        <Label color="#1a3a5c" delay={0.15} fromX={-16}>
          IN THE<br />SPOTLIGHT
        </Label>

        <LogoCard src="/logos/elle.png"   alt="Elle"   delay={0.08} />
        <LogoCard src="/logos/grazia.png" alt="Grazia" delay={0.12} />

        {/* Row 2 */}
        <LogoCard src="/logos/femina.png"         alt="Femina"        delay={0.18} />
        <LogoCard src="/logos/cosmopolitan.png"   alt="Cosmopolitan"  delay={0.22} />
        <LogoCard src="/logos/timelife.png"       alt="Time Life"     delay={0.26} />

        <Label color="#1a1a1a" delay={0.32} fromX={16}>
          WHERE<br />IT COUNTS
        </Label>

      </div>
    </section>
  )
}

export default InTheSpotlight