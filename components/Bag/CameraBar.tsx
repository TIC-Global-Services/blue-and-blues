'use client';

import type { CameraPreset } from './BagViewer';
import styles from './BagViewer.module.css';

const PRESETS: { id: CameraPreset; label: string }[] = [
//   { id: 'orbit', label: 'Free' },
  { id: 'front', label: 'Front' },
  { id: 'back',  label: 'Back'  },
  { id: 'side',  label: 'Side'  },
  // { id: 'top',   label: 'Top'   },
];

interface CameraBarProps {
  activeCamera: CameraPreset;
  onSelect: (preset: CameraPreset) => void;
}

export default function CameraBar({ activeCamera, onSelect }: CameraBarProps) {
  return (
    <nav
      className="
        absolute bottom-22 md:bottom-8 left-1/2 -translate-x-1/2 z-[90]
        backdrop-blur-md bg-white/5 border border-white/10
        flex items-center
      "
      aria-label="Camera presets"
    >
      {PRESETS.map(({ id, label }, index) => {
        const isActive = activeCamera === id;

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`
              relative px-5 py-2 text-xs uppercase tracking-[0.12em]
              transition-colors duration-200
              border-r border-white/10
              ${index === PRESETS.length - 1 ? 'border-r-0' : ''}

              ${isActive 
                ? 'text-white bg-white/10' 
                : 'text-white/50 hover:text-white'}
            `}
          >
            {label}

            {/* minimal active indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white/60" />
            )}
          </button>
        );
      })}
    </nav>
  );
}