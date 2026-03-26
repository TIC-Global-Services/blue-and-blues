'use client';

import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import Image from 'next/image';

export default function PageLoader({ onLoaded }: { onLoaded: () => void }) {
  const { active, progress, loaded } = useProgress();
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!active && loaded > 0 && !hiding) {
      // Notify parent immediately so IntroScreen/hero mount behind the fade
      onLoaded();
      setHiding(true);
      // Remove from DOM only after the CSS fade finishes
      const t = setTimeout(() => setGone(true), 750);
      return () => clearTimeout(t);
    }
  }, [active, loaded, hiding, onLoaded]);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#060c18] transition-opacity duration-700"
      style={{ opacity: hiding ? 0 : 1, pointerEvents: hiding ? 'none' : 'auto' }}
    >
      <Image
        src="/logo/blues-logo.png"
        width={120}
        height={120}
        alt="Blue & Blues"
        className="mb-10 opacity-80"
      />

      {/* Progress bar */}
      <div className="w-32 h-px bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white/50 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
