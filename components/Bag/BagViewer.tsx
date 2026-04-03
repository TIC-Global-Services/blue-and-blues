'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
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

export interface LightingState {
  keyIntensity: number;
  fillIntensity: number;
  rimIntensity: number;
  ambientIntensity: number;
  toneMappingExposure: number;
  envMapIntensity: number;
  envPreset: string;
}

const DEFAULT_LIGHTING: LightingState = {
  keyIntensity: 0.4,
  fillIntensity: 0.5,
  rimIntensity: 0.5,
  ambientIntensity: 0.40,
  toneMappingExposure: 0.45,
  envMapIntensity: 1.2,
  envPreset: 'studio',
};

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
  const [lighting, setLighting] = useState<LightingState>(DEFAULT_LIGHTING);
  const [debugOpen, setDebugOpen] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<ActiveHotspot | null>(null);
  const [hotspotPositions, setHotspotPositions] = useState<
    Record<string, { x: number; y: number; visible: boolean }>
  >({});
  const [fx, setFx] = useState<FXState>(DEFAULT_FX);
  const [flyingTo, setFlyingTo] = useState<string | null>(null);
  const [isClosingInner, setIsClosingInner] = useState(false);
  const [pendingCamera, setPendingCamera] = useState<Exclude<CameraPreset, 'inner'> | null>(null);
  const [pendingInner, setPendingInner] = useState(false);
  const [rotateHint, setRotateHint] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const hintRef = useRef<HTMLDivElement>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Show hint 8s after entering inner view, hide when leaving
  useEffect(() => {
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    if (activeCamera === 'inner') {
      hintTimerRef.current = setTimeout(() => {
        setRotateHint(true);
        hintTimerRef.current = setTimeout(() => setRotateHint(false), 7000);
      }, 3000);
    } else {
      setRotateHint(false);
    }
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [activeCamera]);

  const handleOrbitReady = useCallback(() => {}, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    if (hintRef.current) {
      hintRef.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY - 36}px)`;
    }
  }, []);

  const handlePointerDown = useCallback(() => {
    if (rotateHint) {
      setRotateHint(false);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    }
  }, [rotateHint]);

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
    <div className={styles.root} onMouseMove={handleMouseMove} onPointerDown={handlePointerDown}>


      {/* 3D Canvas — Suspense fallback is null because SceneLoader handles it */}
      <Suspense fallback={null}>
        <BagScene
          modelUrl={modelPath}
          activeCamera={activeCamera}
          flyingTo={flyingTo}
          hotspots={HOTSPOTS}
          fx={fx}
          lightingState={lighting}
          isClosingInner={isClosingInner}
          onInnerCloseDone={handleInnerCloseDone}
          onOrbitReady={handleOrbitReady}
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

      {/* Rotate hint — follows cursor, shown once orbit unlocks */}
      <div
        ref={hintRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] transition-opacity duration-150"
        style={{
          opacity: rotateHint ? 1 : 0,
          transform: `translate(${mousePos.current.x + 16}px, ${mousePos.current.y - 36}px)`,
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '100px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          {/* Rotate icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6" />
            <path d="M21.34 15.57a10 10 0 1 1-.57-8.38" />
          </svg>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', letterSpacing: '0.08em', fontWeight: 500 }}>
            Drag to rotate
          </span>
        </div>
      </div>

      {/* ── Lighting debug panel ── */}
      <div className="hidden fixed pointer-events-auto select-none" style={{ top: '100px', right: '16px', zIndex: 99999 }}>
        <button
          onClick={() => setDebugOpen((v) => !v)}
          className="bg-black/70 text-white/80 text-[10px] tracking-widest uppercase px-3 py-1.5 border border-white/20 hover:bg-white/10 transition-colors"
        >
          {debugOpen ? 'Close' : '⚙ Lighting'}
        </button>

        {debugOpen && (
          <div className="mt-1 bg-black/80 backdrop-blur border border-white/15 p-4 w-64 text-white/80 text-[11px] flex flex-col gap-3">
            {(
              [
                { key: 'keyIntensity', label: 'Key Light', min: 0, max: 5, step: 0.05 },
                { key: 'fillIntensity', label: 'Fill Light', min: 0, max: 5, step: 0.05 },
                { key: 'rimIntensity', label: 'Rim Light', min: 0, max: 5, step: 0.05 },
                { key: 'ambientIntensity', label: 'Ambient', min: 0, max: 5, step: 0.05 },
                { key: 'toneMappingExposure', label: 'Exposure', min: 0, max: 3, step: 0.05 },
                { key: 'envMapIntensity', label: 'Env Map', min: 0, max: 5, step: 0.1 },
              ] as const
            ).map(({ key, label, min, max, step }) => (
              <div key={key}>
                <div className="flex justify-between mb-0.5">
                  <span>{label}</span>
                  <span className="font-mono">{(lighting[key] as number).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={lighting[key] as number}
                  onChange={(e) =>
                    setLighting((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-white/60 h-1"
                />
              </div>
            ))}

            <div>
              <div className="mb-0.5">Environment</div>
              <select
                value={lighting.envPreset}
                onChange={(e) => setLighting((prev) => ({ ...prev, envPreset: e.target.value }))}
                className="w-full bg-black/50 border border-white/20 text-white/80 px-2 py-1 text-[11px]"
              >
                {['studio', 'city', 'dawn', 'night', 'forest', 'apartment', 'lobby', 'park', 'sunset', 'warehouse'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setLighting(DEFAULT_LIGHTING)}
              className="mt-1 w-full text-[10px] tracking-widest uppercase border border-white/20 py-1 hover:bg-white/10 transition-colors"
            >
              Reset
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

/* ─── Public export ─── */
export default function BagViewer({ modelPath = '/model/axis17.glb' }: BagViewerProps) {
  return <BagViewerInner modelPath={modelPath} />;
}

