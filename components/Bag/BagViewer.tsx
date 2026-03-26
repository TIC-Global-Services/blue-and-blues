'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useCallback, useEffect } from 'react';
import type { HotspotDef, ActiveHotspot } from './types';
import { HOTSPOTS } from './Hotspots';
import HotspotOverlay from './HotspotOverlay';
import InfoPanel from './InfoPanel';
import CameraBar from './CameraBar';
import { useAudio } from '../../hooks/useAudio';
import styles from './BagViewer.module.css';

// Dynamically import the canvas to avoid SSR issues
const BagScene = dynamic(() => import('./BagScene'), { ssr: false });

export type CameraPreset = 'front' | 'back' | 'side' | 'inner';

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
  bloom: false,
  bloomIntensity: 0.2,
  dof: false,
  dofFocusDistance: 0.02,
  dofBokehScale: 3,
  colorGrading: true,
  exposure: 0.95,
  saturation: 0.8,
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
  const [isClosingInner, setIsClosingInner] = useState(false);
  const [pendingCamera, setPendingCamera] = useState<Exclude<CameraPreset, 'inner'> | null>(null);
  const [pendingInner, setPendingInner] = useState(false);
  const { playTap } = useAudio();

  // After navigating to front to clear a hotspot, wait for camera to settle then open inner view
  useEffect(() => {
    if (!pendingInner) return;
    const timer = setTimeout(() => {
      setActiveCamera('inner');
      setPendingInner(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [pendingInner]);

  const handleHotspotClick = useCallback((hotspot: HotspotDef) => {
    playTap();
    setActiveHotspot({ hotspot, open: true });
    setFlyingTo(hotspot.id);
  }, [playTap]);

  const handleClosePanel = useCallback(() => {
    playTap();
    setActiveHotspot(null);
    setFlyingTo(null);
    setActiveCamera('front');
  }, [playTap]);

  const handleCameraSelect = useCallback((preset: CameraPreset) => {
    playTap();

    if (activeCamera === 'inner' && preset !== 'inner') {
      // Play close animation, then smoothly move to target camera
      setPendingCamera(preset as Exclude<CameraPreset, 'inner'>);
      setIsClosingInner(true);
      return;
    }

    if (preset === 'inner' && (activeCamera !== 'front' || flyingTo !== null || activeHotspot !== null)) {
      // Always return to front first so Camera001 starts from the same position, then open inner view
      setActiveHotspot(null);
      setFlyingTo(null);
      setActiveCamera('front');
      setPendingInner(true);
      return;
    }

    setActiveCamera(preset);
    setActiveHotspot(null);
    setFlyingTo(null);
  }, [playTap, activeCamera, flyingTo, activeHotspot]);

  const handleInnerCloseDone = useCallback(() => {
    if (pendingCamera) {
      setActiveCamera(pendingCamera);
      setActiveHotspot(null);
      setFlyingTo(null);
    }
    setPendingCamera(null);
    setIsClosingInner(false);
  }, [pendingCamera]);


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
          isClosingInner={isClosingInner}
          onInnerCloseDone={handleInnerCloseDone}
          onHotspotPositionsUpdate={setHotspotPositions}
        />
      </Suspense>

      {/* Hotspot dots overlaid on canvas — fade out instead of hard unmount */}
      {(activeCamera === 'front' || pendingInner) && (
        <div
          className="transition-opacity duration-400"
          style={{ opacity: pendingInner ? 0 : 1, pointerEvents: pendingInner ? 'none' : 'auto' }}
        >
          <HotspotOverlay
            hotspots={HOTSPOTS}
            positions={hotspotPositions}
            activeId={activeHotspot?.hotspot.id ?? null}
            onHotspotClick={handleHotspotClick}
          />
        </div>
      )}

      {/* Click-outside overlay — below UI controls, above canvas */}
      {activeHotspot?.open && (
        <div
          className="absolute inset-0 z-[50]"
          onClick={handleClosePanel}
          aria-hidden="true"
        />
      )}

      {/* Slide-in info panel */}
      <InfoPanel activeHotspot={activeHotspot} onClose={handleClosePanel} />

      {/* Camera preset bar */}
      <CameraBar activeCamera={activeCamera} onSelect={handleCameraSelect} />

    </div>
  );
}

/* ─── Public export ─── */
export default function BagViewer({ modelPath = '/model/bag_final.glb' }: BagViewerProps) {
  return <BagViewerInner modelPath={modelPath} />;
}