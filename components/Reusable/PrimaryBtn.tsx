"use client";

import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type Variant = "primary" | "outline" | "ghost";
type Mode = "dark" | "light";

type PrimaryBtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text?: string;
  loading?: boolean;
  animated?: boolean;
  variant?: Variant;
  mode?: Mode;
};

export default function PrimaryBtn({
  text,
  children,
  loading = false,
  animated = true,
  variant = "primary",
  mode = "dark",
  className,
  ...props
}: PrimaryBtnProps) {
  const baseStyles = `
    relative group
    px-5 py-2 md:px-8 md:py-2.5
    rounded-full
    flex items-center justify-center
    overflow-hidden isolate
    font-medium tracking-wide
    text-xs md:text-sm
    backdrop-blur-sm
    transition-all duration-300 ease-out
    active:scale-[0.96]
    cursor-pointer
  `;

  const darkVariants: Record<Variant, string> = {
    primary: `
      text-white
      border border-white/20
      shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.25)]
      hover:bg-white/20
      hover:border-white/30
    `,
    outline: `
      bg-transparent
      text-white
      border border-white/30
      hover:bg-white/10
    `,
    ghost: `
      bg-transparent
      text-white/80
      hover:text-white
      hover:bg-white/10
    `,
  };

  const lightVariants: Record<Variant, string> = {
    primary: `
      text-black
      border border-white
      shadow-[inset_0_1px_1px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.12)]
      hover:bg-white/60
      hover:border-white/80
    `,
    outline: `
      bg-transparent
      text-black
      border border-black/30
      hover:bg-black/10
    `,
    ghost: `
      bg-transparent
      text-black/70
      hover:text-black
      hover:bg-black/10
    `,
  };

  const variantStyles = mode === "light" ? lightVariants[variant] : darkVariants[variant];

  const highlightClass =
    mode === "light"
      ? "absolute inset-0 rounded-full bg-gradient-to-b from-black/5 to-transparent opacity-40 pointer-events-none"
      : "absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30 pointer-events-none";

  const shimmerClass =
    mode === "light"
      ? "bg-gradient-to-r from-transparent via-black/10 to-transparent"
      : "bg-gradient-to-r from-transparent via-white/30 to-transparent";

  const spinnerClass =
    mode === "light"
      ? "w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"
      : "w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin";

  return (
    <button
      className={twMerge(clsx(baseStyles, variantStyles, className))}
      {...props}
    >
      {/* Glass Highlight Layer */}
      <span className={highlightClass} />

      {/* Shimmer Effect */}
      {animated && (
        <span
          className={`
            absolute inset-0
            -translate-x-full
            group-hover:translate-x-full
            transition-transform duration-700 ease-in-out
            skew-x-12
            ${shimmerClass}
          `}
        />
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? <span className={spinnerClass} /> : (children ?? text)}
      </span>
    </button>
  );
}