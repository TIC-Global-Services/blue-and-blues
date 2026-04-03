'use client';

import { useEffect, useState } from 'react';

function useIsOverLightBg() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () => {
      const buttonY = window.innerHeight - 32 - 16;
      const sections = document.querySelectorAll('[data-light-bg]');
      let light = false;
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= buttonY && rect.bottom >= buttonY) light = true;
      });
      setIsLight(light);
    };

    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, []);

  return isLight;
}

interface MusicButtonProps {
  playing: boolean;
  onToggle: () => void;
}

export default function MusicButton({ playing, onToggle }: MusicButtonProps) {
  const isLight = useIsOverLightBg();

  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 md:-translate-x-0 md:left-10 z-[90] flex items-center gap-2.5 transition-colors duration-300 cursor-pointer ${isLight ? 'text-black/70 hover:text-black' : 'text-white/60 hover:text-white'}`}
      aria-label={playing ? 'Mute soundtrack' : 'Play soundtrack'}
    >
      {/* Animated sound bars */}
      <span className="flex items-center gap-[2px] h-6">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-[2px] rounded-full bg-current"
            style={{
              height: playing ? undefined : '30%',
              animation: playing
                ? `musicBar${i} 0.${5 + i}s ease-in-out infinite alternate`
                : 'none',
            }}
          />
        ))}
      </span>

      <span className="text-[11px] uppercase tracking-[3px]">
        {playing ? 'Sound On' : 'Sound Off'}
      </span>

      <style>{`
        @keyframes musicBar1 { from { height: 25% } to { height: 100% } }
        @keyframes musicBar2 { from { height: 60% } to { height: 30%  } }
        @keyframes musicBar3 { from { height: 40% } to { height: 90%  } }
        @keyframes musicBar4 { from { height: 80% } to { height: 20%  } }
      `}</style>
    </button>
  );
}
