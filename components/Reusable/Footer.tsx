"use client"

import { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

/* ── animation variants ─────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport:  { once: true, margin: "-40px" },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
})

const fadeIn = (delay = 0) => ({
  initial:   { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport:  { once: true, margin: "-40px" },
  transition: { duration: 0.7, delay, ease: "easeOut" as const },
})

/* ── link with underline hover ──────────────────────────── */
const FooterLink = ({ href, children, accent = false }: { href: string; children: ReactNode; accent?: boolean }) => (
  <Link
    href={href}
    className={`
      relative inline-block text-sm tracking-wide transition-colors duration-200
      after:absolute after:bottom-0 after:left-0 after:h-px after:w-0
      after:bg-current after:transition-all after:duration-300
      hover:after:w-full
      ${accent ? "text-secondary hover:text-white" : "text-white/50 hover:text-white/90"}
    `}
  >
    {children}
  </Link>
)

/* ── section heading ────────────────────────────────────── */
const FooterHeading = ({ children }: { children: ReactNode }) => (
  <h3 className="text-secondary uppercase font-medium tracking-[0.08em] text-base sm:text-2xl mb-4 sm:mb-5">
    {children}
  </h3>
)

/* ── main footer ────────────────────────────────────────── */
const Footer = () => {
  return (
    <footer className="p-2">
      <div className="relative bg-[#111312] text-white rounded-xl overflow-hidden">

        {/* subtle top border glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-secondary/40 to-transparent" />

        {/* ── TOP ROW: about + legal ───────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 px-6 md:px-10 pt-12 sm:pt-16 pb-10 md:pb-14">

          {/* About */}
          <motion.div {...fadeUp(0.05)}>
            <FooterHeading>About Blue&Blues</FooterHeading>
            <p className="text-white/75 text-sm sm:text-[1rem] leading-relaxed max-w-lg">
              We Craft Functional Luxury, Focusing On Intentional Design &amp;
              Bringing It To Life With Ethical Craftsmanship, Using Responsibly
              Sourced Materials.
            </p>
          </motion.div>

          {/* Legal */}
          <motion.div {...fadeUp(0.12)} className="md:text-right">
            <FooterHeading>Legal Notice</FooterHeading>
            <p className="text-white/75 text-sm sm:text-[1rem] leading-relaxed md:ml-auto max-w-md md:max-w-none">
              Registered Trademarks And Designs Under EUIPO®. Owned And
              Operated By Blue &amp; Blues, Committed To Ethical Sourcing And
              Transparency.
            </p>
          </motion.div>
        </div>

        {/* ── CENTRE: logo block ───────────────────────────── */}
        <div className="flex flex-col items-center justify-center py-10 px-6">

          {/* logo mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <Image
              src="/logo/blues-logo.png"
              alt="Blue & Blues"
              width={300}
              height={300}
              className="object-contain"
            />
          </motion.div>

          {/* copyright bar */}
          <motion.div
            {...fadeIn(0.25)}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.7rem] sm:text-xs tracking-widest text-white/90 uppercase"
          >
            <span>
              Copyright © 2026{" "}
              <span className="text-secondary">B&amp;B</span>.
              All Rights Reserved.
            </span>

            <span className="hidden sm:inline text-white/90">×</span>

            <span>
              Designed &amp; Developed By{" "}
              <Link
                href="https://www.theinternetcompany.one/"
                target="_blank"
                className="text-secondary hover:text-white transition-colors duration-200"
              >
                The Internet Company
              </Link>
            </span>
          </motion.div>
        </div>

        {/* ── BOTTOM ROW: menu + support ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 px-6 sm:px-10 md:px-14 lg:px-20 pt-10 pb-12 sm:pb-16">

          {/* Menu */}
          <motion.div {...fadeUp(0.08)}>
            <FooterHeading>Menu</FooterHeading>
            <div className="flex flex-col gap-y-3">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <FooterLink href="#">Our Story</FooterLink>
                <FooterLink href="#">Italian Heritage</FooterLink>
                <FooterLink href="#">Core Values</FooterLink>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <FooterLink href="#">Our Materials</FooterLink>
                <FooterLink href="#">Care Guide</FooterLink>
              </div>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div {...fadeUp(0.16)} className="md:text-right">
            <FooterHeading>Support</FooterHeading>
            <div className="flex flex-col gap-y-3">
              <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-3">
                <FooterLink href="#">Contact Us</FooterLink>
                <FooterLink href="#">Shipping Policy</FooterLink>
                <FooterLink href="#">Returns &amp; Exchange</FooterLink>
              </div>
              <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-3">
                <FooterLink href="#">Terms &amp; Conditions</FooterLink>
                <FooterLink href="#">Privacy Policy</FooterLink>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
