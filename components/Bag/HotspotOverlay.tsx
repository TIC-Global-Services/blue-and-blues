'use client';

import { useCallback } from 'react';
import type { HotspotDef } from './types';
import styles from './BagViewer.module.css';

interface HotspotOverlayProps {
  hotspots: HotspotDef[];
  positions: Record<string, { x: number; y: number; visible: boolean }>;
  activeId: string | null;
  onHotspotClick: (hotspot: HotspotDef) => void;
}

export default function HotspotOverlay({
  hotspots,
  positions,
  activeId,
  onHotspotClick,
}: HotspotOverlayProps) {
  return (
    <div className={styles.hotspotLayer} aria-label="Model hotspots">
      {hotspots.map((hs) => {
        const pos = positions[hs.id];
        if (!pos?.visible) return null;

        const isActive = activeId === hs.id;

        return (
          <button
            key={hs.id}
            className={`${styles.hotspot} ${isActive ? styles.hotspotActive : ''}`}
            style={{
              left: pos.x,
              top: pos.y,
              '--hs-color': hs.color ?? '#0de65a',
            } as React.CSSProperties}
            onClick={() => onHotspotClick(hs)}
            aria-label={hs.label}
            title={hs.label}
          >
            <span className={styles.hotspotDot} />
            {!isActive && <span className={styles.hotspotRing} />}
            <span className={styles.hotspotLabel}>{hs.label}</span>
          </button>
        );
      })}
    </div>
  );
}