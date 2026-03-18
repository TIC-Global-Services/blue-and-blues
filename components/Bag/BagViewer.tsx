'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useCallback } from 'react';
import type { HotspotDef, ActiveHotspot } from './types';
import { HOTSPOTS } from './Hotspots';
import HotspotOverlay from './HotspotOverlay';
import InfoPanel from './InfoPanel';
import CameraBar from './CameraBar';
import styles from './BagViewer.module.css';

// Dynamically import the canvas to avoid SSR issues
const BagScene = dynamic(() => import('./BagScene'), { ssr: false });

export type CameraPreset = 'front' | 'back' | 'side' | 'top';

export interface FXState {
  bloom: boolean;
  bloomIntensity: number;
  dof: boolean;
  dofFocusDistance: number;
  dofBokehScale: number;
  colorGrading: boolean;
  exposure: number;
  saturation: number;
}

const DEFAULT_FX: FXState = {
  bloom: true,
  bloomIntensity: 0.8,
  dof: false,
  dofFocusDistance: 0.02,
  dofBokehScale: 3,
  colorGrading: true,
  exposure: 1.1,
  saturation: 1.15,
};

interface BagViewerProps {
  modelPath?: string;
}

/* ─── Inner component — needs to be inside a drei provider context ─── */
function BagViewerInner({ modelPath }: { modelPath: string }) {

  const [activeCamera, setActiveCamera] = useState<CameraPreset>('front');
  const [activeHotspot, setActiveHotspot] = useState<ActiveHotspot | null>(null);
  const [hotspotPositions, setHotspotPositions] = useState<
    Record<string, { x: number; y: number; visible: boolean }>
  >({});
  const [fx, setFx] = useState<FXState>(DEFAULT_FX);
  const [flyingTo, setFlyingTo] = useState<string | null>(null);

  const handleHotspotClick = useCallback((hotspot: HotspotDef) => {
    setActiveHotspot({ hotspot, open: true });
    setFlyingTo(hotspot.id);
  }, []);

  const handleClosePanel = useCallback(() => {
    setActiveHotspot(null);
    setFlyingTo(null);
    setActiveCamera('front');
  }, []);


  return (
    <div className={styles.root}>
      

      {/* 3D Canvas — Suspense fallback is null because SceneLoader handles it */}
      <Suspense fallback={null}>
        <BagScene
          modelUrl={modelPath}
          activeCamera={activeCamera}
          flyingTo={flyingTo}
          hotspots={HOTSPOTS}
          fx={fx}
          onHotspotPositionsUpdate={setHotspotPositions}
        />
      </Suspense>

      {/* Hotspot dots overlaid on canvas */}
      <HotspotOverlay
        hotspots={HOTSPOTS}
        positions={hotspotPositions}
        activeId={activeHotspot?.hotspot.id ?? null}
        onHotspotClick={handleHotspotClick}
      />

      {/* Slide-in info panel */}
      <InfoPanel activeHotspot={activeHotspot} onClose={handleClosePanel} />

      {/* Camera preset bar */}
      <CameraBar activeCamera={activeCamera} onSelect={setActiveCamera} />

    </div>
  );
}

/* ─── Public export ─── */
export default function BagViewer({ modelPath = '/bag.glb' }: BagViewerProps) {
  return <BagViewerInner modelPath={modelPath} />;
}