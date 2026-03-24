'use client';

interface MusicButtonProps {
  playing: boolean;
  onToggle: () => void;
}

export default function MusicButton({ playing, onToggle }: MusicButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-8 left-10 z-[90] flex items-center gap-2.5 text-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
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
