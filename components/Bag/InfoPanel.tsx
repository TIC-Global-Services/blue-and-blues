'use client';

import type { ActiveHotspot } from './types';
import styles from './BagViewer.module.css';

interface InfoPanelProps {
  activeHotspot: ActiveHotspot | null;
  onClose: () => void;
}

export default function InfoPanel({ activeHotspot, onClose }: InfoPanelProps) {
  const hs = activeHotspot?.hotspot;

  return (
   <aside
   className={`
    fixed top-0 right-0 h-full w-[350px] z-100
    backdrop-blur-lg bg-white/10 border-l border-y border-white/20
    transition-transform duration-300
    ${activeHotspot?.open ? 'translate-x-0' : 'translate-x-full'}
  `}
  aria-live="polite"
  role="complementary"
>
  {hs && (
    <div className="relative h-full flex flex-col p-6 pt-[25%] text-white">

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-[13%] cursor-pointer right-4 text-white/70 hover:text-white text-xl"
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
      <h2 className="text-2xl font-semibold mb-3">
        {hs.label}
      </h2>

      {/* Description */}
      <p className="text-sm text-white/80 leading-relaxed">
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
          className="text-sm cursor-pointer text-white/70 hover:text-white transition"
        >
          ← Back to overview
        </button>

      </div>
    </div>
  )}
</aside>
  );
}