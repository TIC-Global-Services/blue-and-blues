"use client"
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

const BornBetweenIntension = () => {
    const sectionRef        = useRef<HTMLDivElement>(null)
    const mainFrameRef      = useRef<HTMLDivElement>(null)
    const leftPanelRef      = useRef<HTMLDivElement>(null)
    const rightPanelRef     = useRef<HTMLDivElement>(null)
    const leftTextRef       = useRef<HTMLParagraphElement>(null)   // desktop "INTENTION & FORM"
    const rightTextRef      = useRef<HTMLParagraphElement>(null)   // desktop "BORN BETWEEN"
    const mobileTopRef      = useRef<HTMLDivElement>(null)
    const mobileBottomRef   = useRef<HTMLDivElement>(null)
    const mobileTopTextRef  = useRef<HTMLParagraphElement>(null)   // mobile "BORN BETWEEN"
    const mobileBotTextRef  = useRef<HTMLParagraphElement>(null)   // mobile "INTENTION & FORM"

    useEffect(() => {
        const isMobile = window.innerWidth < 768

        const ctx = gsap.context(() => {
            if (isMobile) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1.5,
                    }
                })

                // Phase 1: shrink main frame to centre strip
                tl.to(mainFrameRef.current, {
                    width: "86%",
                    height: "40%",
                    left: "7%",
                    top: "30%",
                    duration: 1,
                    ease: "none",
                }, 0)

                tl.to(mainFrameRef.current!.querySelector('img'), {
                    objectPosition: "60% center",
                    duration: 1,
                    ease: "none",
                }, 0)

                // Phase 2: image panels slide in
                tl.fromTo(mobileTopRef.current,
                    { y: "-100%", opacity: 0 },
                    { y: "0%",    opacity: 1, duration: 1, ease: "power3.out" },
                    1
                )
                tl.fromTo(mobileBottomRef.current,
                    { y: "100%", opacity: 0 },
                    { y: "0%",   opacity: 1, duration: 1, ease: "power3.out" },
                    1
                )

                // Phase 3: "BORN BETWEEN" (top panel) — slides UP from below
                tl.fromTo(mobileTopTextRef.current,
                    { y: "30px", opacity: 0 },
                    { y: "0px",  opacity: 1, duration: 0.6, ease: "power2.out" },
                    1.8
                )
                // Phase 3: "INTENTION & FORM" (bottom panel) — slides DOWN from above
                tl.fromTo(mobileBotTextRef.current,
                    { y: "-30px", opacity: 0 },
                    { y: "0px",   opacity: 1, duration: 0.6, ease: "power2.out" },
                    2.1
                )

            } else {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1.5,
                    }
                })

                // Phase 1: shrink main frame
                tl.to(mainFrameRef.current, {
                    width: "40%",
                    height: "80%",
                    left: "30%",
                    top: "10%",
                    duration: 1,
                    ease: "none",
                }, 0)

                tl.to(mainFrameRef.current!.querySelector('img'), {
                    objectPosition: "60% center",
                    duration: 1,
                    ease: "none",
                }, 0)

                // Phase 2: side panels (images only, text hidden initially)
                tl.fromTo(leftPanelRef.current,
                    { x: "-100%", opacity: 0 },
                    { x: "0%",    opacity: 1, duration: 1, ease: "power3.out" },
                    1
                )
                tl.fromTo(rightPanelRef.current,
                    { x: "100%", opacity: 0 },
                    { x: "0%",   opacity: 1, duration: 1, ease: "power3.out" },
                    1
                )

                // Phase 3: "INTENTION & FORM" — slides DOWN from above
                tl.fromTo(leftTextRef.current,
                    { y: "-30px", opacity: 0 },
                    { y: "0px",   opacity: 1, duration: 0.6, ease: "power2.out" },
                    2.1
                )

                // Phase 3: "BORN BETWEEN" — slides UP from below
                tl.fromTo(rightTextRef.current,
                    { y: "30px", opacity: 0 },
                    { y: "0px",  opacity: 1, duration: 0.6, ease: "power2.out" },
                    1.8
                )
            }
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} data-light-bg className="h-[300vh] p-5">
            <div className="sticky top-0 h-screen overflow-hidden bg-white">

                {/* ── Left Panel (desktop only) ───────────────── */}
                <div
                    ref={leftPanelRef}
                    className="hidden md:flex absolute top-0 left-0 w-[30%] h-[90%] opacity-0 z-[1] flex-col items-end py-5 gap-3"
                >
                    <div className="relative rounded-2xl overflow-hidden w-full" style={{ flex: "6 1 0" }}>
                        <Image src="/Home/left_top.jpg" fill alt="left top" className="object-cover" />
                    </div>
                    <div className="relative rounded-2xl overflow-hidden w-[80%]" style={{ flex: "4 1 0" }}>
                        <Image src="/Home/left_bottom.jpg" fill alt="left bottom" className="object-cover" />
                    </div>
                    {/* "INTENTION & FORM" — slides DOWN from above */}
                    <p
                        ref={leftTextRef}
                        className="m-0 uppercase font-medium leading-[1.05] tracking-[-0.01em] text-[clamp(2.5rem,2.2vw,4.5rem)] text-primary text-right opacity-0"
                    >
                        INTENTION<br />& FORM
                    </p>
                </div>

                {/* ── Main Frame ─────────────────────────────── */}
                <div
                    ref={mainFrameRef}
                    className="absolute top-0 left-0 w-full h-full z-[2] p-5 box-border"
                >
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                        <Image
                            src="/Home/main_frame.png"
                            fill
                            alt="main frame"
                            className="object-cover object-center"
                            priority
                        />
                    </div>
                </div>

                {/* ── Right Panel (desktop only) ──────────────── */}
                <div
                    ref={rightPanelRef}
                    className="hidden md:flex absolute bottom-0 right-0 w-[30%] h-[90%] opacity-0 z-[1] py-5 flex-col gap-3"
                >
                    {/* "BORN BETWEEN" — slides UP from below */}
                    <p
                        ref={rightTextRef}
                        className="m-0 uppercase font-medium leading-[1.05] tracking-[-0.01em] text-[clamp(3rem,3vw,5rem)] text-primary opacity-0"
                    >
                        BORN<br />BETWEEN
                    </p>
                    <div className="relative rounded-2xl overflow-hidden w-[80%]" style={{ flex: "4 1 0" }}>
                        <Image src="/Home/right_top.jpg" fill alt="right top" className="object-cover" />
                    </div>
                    <div className="relative rounded-2xl overflow-hidden" style={{ flex: "6 1 0" }}>
                        <Image src="/Home/right_bottom.jpg" fill alt="right bottom" className="object-cover" />
                    </div>
                </div>

                {/* ── Mobile Top: left_top image + "BORN BETWEEN" text ── */}
                <div
                    ref={mobileTopRef}
                    className="md:hidden absolute top-0 left-0 right-0 h-[28%] z-[3] opacity-0 flex gap-3 px-4 pt-4"
                >
                    <div className="relative rounded-2xl overflow-hidden flex-1">
                        <Image src="/Home/left_top.jpg" fill alt="left top" className="object-cover" />
                    </div>
                    <div className="flex items-end pb-1 flex-shrink-0">
                        {/* slides UP from below */}
                        <p
                            ref={mobileTopTextRef}
                            className="m-0 uppercase font-medium leading-[1.05] tracking-[-0.01em] text-[clamp(1.2rem,4.5vw,1.8rem)] text-primary text-left opacity-0"
                        >
                            BORN<br />BETWEEN
                        </p>
                    </div>
                </div>

                {/* ── Mobile Bottom: "INTENTION & FORM" text + right_bottom image ── */}
                <div
                    ref={mobileBottomRef}
                    className="md:hidden absolute bottom-0 left-0 right-0 h-[28%] z-[3] opacity-0 flex gap-3 px-4 pb-4"
                >
                    <div className="flex items-start pt-1 flex-shrink-0">
                        {/* slides DOWN from above */}
                        <p
                            ref={mobileBotTextRef}
                            className="m-0 uppercase font-medium leading-[1.05] tracking-[-0.01em] text-[clamp(1.4rem,5vw,2rem)] text-primary text-right opacity-0"
                        >
                            INTENTION<br />& FORM
                        </p>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden flex-1">
                        <Image src="/Home/right_bottom.jpg" fill alt="right bottom" className="object-cover" />
                    </div>
                </div>

            </div>
        </section>
    )
}

export default BornBetweenIntension
