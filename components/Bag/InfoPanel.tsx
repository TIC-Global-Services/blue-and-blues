'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ActiveHotspot } from './types';
import styles from './BagViewer.module.css';

interface InfoPanelProps {
  activeHotspot: ActiveHotspot | null;
  onClose: () => void;
}

export default function InfoPanel({ activeHotspot, onClose }: InfoPanelProps) {
  const hs = activeHotspot?.hotspot;
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
   <aside
   className={`
    fixed z-9999
    backdrop-blur-lg bg-white/10
    transition-transform duration-300

    bottom-0 left-0 right-0 h-[30%] w-full border-t border-x border-white/20
    md:top-0 md:bottom-auto md:left-auto md:right-0 md:h-full md:w-[350px] md:border-l md:border-y md:border-x-0

    ${activeHotspot?.open
      ? 'translate-y-0 md:translate-y-0 md:translate-x-0'
      : 'translate-y-full md:translate-y-0 md:translate-x-full'}
  `}
  aria-live="polite"
  role="complementary"
>
  {hs && (
    <div className="relative h-full flex flex-col p-6  text-white">

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 cursor-pointer right-4 text-white/70 hover:text-white text-xl"
        aria-label="Close panel"
      >
        ✕
      </button>

      {/* Accent Bar */}
      <div
        className="w-[90%] h-[2px] mb-4"
        style={{ background: hs.color ?? '#0de65a' }}
      />

      {/* Tag */}
      <div className="text-xs uppercase tracking-widest text-white/60 mb-2">
        Feature Detail
      </div>

      {/* Title */}
      <h2 className="text-2xl font-medium uppercase mb-3">
        {hs.label}
      </h2>

      {/* Description */}
      <p className="text-xs text-white/80 leading-relaxed uppercase text-justify">
        {hs.description}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-6">

        {/* Badge */}
        <span
          className="px-3 py-1 text-xs border"
          style={{
            background: `${hs.color ?? '#0de65a'}22`,
            color: hs.color ?? '#0de65a',
            borderColor: `${hs.color ?? '#0de65a'}44`,
          }}
        >
          #{hs.id}
        </span>

        {/* Back Button */}
        <button
          onClick={onClose}
          className="text-sm cursor-pointer uppercase text-white/70 hover:text-white transition"
        >
          ← Close
        </button>

      </div>
    </div>
  )}
</aside>,
  document.body
  );
}