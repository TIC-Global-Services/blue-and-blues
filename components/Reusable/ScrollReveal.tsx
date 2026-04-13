'use client'
import React, { useEffect, useRef, useMemo, ReactNode, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.05, // 👈 softer start
  baseRotation = 2,   // 👈 less aggressive
  blurStrength = 6,   // 👈 more premium blur
  containerClassName = '',
  textClassName = '',
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';

    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;

      // 🔥 Handle "&"
      if (word === '&') {
        return (
          <span className="inline-block word font-inter" key={index}>
            &
          </span>
        );
      }

      return (
        <span className="inline-block word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef?.current ?? window;
    const wordElements = el.querySelectorAll<HTMLElement>('.word');

    const triggers: ScrollTrigger[] = [];

    // 🔥 Rotation (slower + longer)
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        scroller,
        start: 'top 85%',
        end: 'bottom bottom-=100', // 👈 longer scroll distance
        scrub: 1.5,    // 👈 smoother lag
        animation: gsap.fromTo(
          el,
          { transformOrigin: '0% 50%', rotate: baseRotation },
          { ease: 'none', rotate: 0 }
        ),
      })
    );

    // 🔥 Opacity reveal
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        scroller,
        start: 'top 85%',
        end: 'bottom bottom-=100',
        scrub: 1,
        animation: gsap.fromTo(
          wordElements,
          { opacity: baseOpacity, willChange: 'opacity' },
          {
            ease: 'none',
            opacity: 1,
            stagger: 0.1, 
          }
        ),
      })
    );

    // 🔥 Blur reveal
    if (enableBlur) {
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          scroller,
          start: 'top 85%',
          end: 'bottom bottom-=100',
          scrub: 1.5,
          animation: gsap.fromTo(
            wordElements,
            { filter: `blur(${blurStrength}px)` },
            {
              ease: 'none',
              filter: 'blur(0px)',
              stagger: 0.08,
            }
          ),
        })
      );
    }

    return () => {
      triggers.forEach(t => t.kill());
    };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, blurStrength]);

  return (
    <h2 ref={containerRef} className={`my-5 ${containerClassName}`}>
      <p
        className={`text-[clamp(1.3rem,3vw,2.5rem)] leading-normal font-medium uppercase text-primary ${textClassName}`}
      >
        {splitText}
      </p>
    </h2>
  );
};

export default ScrollReveal;