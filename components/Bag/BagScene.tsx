'use client';

import { useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import {
  useGLTF,
  OrbitControls,
  Environment,
  ContactShadows,
  useProgress,
  Html,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  ToneMapping,
  ColorAverage,
  HueSaturation,
  BrightnessContrast,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { easing } from 'maath';
import type { HotspotDef } from './types';
import type { FXState, CameraPreset } from './BagViewer';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

/* ─────────────────────────────────────────────
   Camera preset definitions
───────────────────────────────────────────── */
const CAMERA_PRESETS: Record<CameraPreset, { position: THREE.Vector3; target: THREE.Vector3 }> = {
//   orbit:  { position: new THREE.Vector3(0, 0.3, 2.8),   target: new THREE.Vector3(0, 0, 0) },
  front:  { position: new THREE.Vector3(0, 0.1, 2.5),   target: new THREE.Vector3(0, 0, 0) },
  back:   { position: new THREE.Vector3(0, 0.1, -2.5),  target: new THREE.Vector3(0, 0, 0) },
  side:   { position: new THREE.Vector3(2.5, 0.1, 0),   target: new THREE.Vector3(0, 0, 0) },
  top:    { position: new THREE.Vector3(0, 3.2, 0.5),   target: new THREE.Vector3(0, 0, 0) },
};


/* ─────────────────────────────────────────────
   Loaded bag mesh
───────────────────────────────────────────── */
interface BagModelProps {
  url: string;
}

function BagModel({ url }: BagModelProps) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Ensure physically correct materials
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.envMapIntensity = 1.2;
              mat.needsUpdate = true;
            }
          });
        }
      }
    });

    // Auto-center and scale to fit unit box
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.6 / maxDim;
    scene.scale.setScalar(scale);

    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
    scene.position.sub(center);
  }, [scene]);

  return <primitive object={scene} />;
}

/* ─────────────────────────────────────────────
   Smooth camera controller
───────────────────────────────────────────── */
interface CameraRigProps {
  preset: CameraPreset;
  flyTarget: { position: THREE.Vector3; target: THREE.Vector3 } | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

function CameraRig({ preset, flyTarget, controlsRef }: CameraRigProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isFlying = useRef(false);

  useEffect(() => {
    const dest = flyTarget ?? CAMERA_PRESETS[preset];
    targetPos.current.copy(dest.position);
    targetLookAt.current.copy(dest.target);
    isFlying.current = true;
  }, [preset, flyTarget]);

  useFrame((_state, delta) => {
    easing.damp3(camera.position, targetPos.current, 0.35, delta);
    if (controlsRef.current) {
      easing.damp3(controlsRef.current.target, targetLookAt.current, 0.35, delta);
      controlsRef.current.update();
    }
  });

  return null;
}

/* ─────────────────────────────────────────────
   Hotspot world → screen projection
───────────────────────────────────────────── */
interface HotspotTrackerProps {
  hotspots: HotspotDef[];
  onPositionsUpdate: (positions: Record<string, { x: number; y: number; visible: boolean }>) => void;
}

function HotspotTracker({ hotspots, onPositionsUpdate }: HotspotTrackerProps) {
  const { camera, size } = useThree();
  const tmpVec = useRef(new THREE.Vector3());
  const frustum = useRef(new THREE.Frustum());
  const projMatrix = useRef(new THREE.Matrix4());

  useFrame(() => {
    projMatrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(projMatrix.current);

    const positions: Record<string, { x: number; y: number; visible: boolean }> = {};

    hotspots.forEach(({ id, position }) => {
      tmpVec.current.set(...position);
      const inFrustum = frustum.current.containsPoint(tmpVec.current);
      tmpVec.current.project(camera);

      const x = (tmpVec.current.x * 0.5 + 0.5) * size.width;
      const y = (-tmpVec.current.y * 0.5 + 0.5) * size.height;
      // visible if in front of camera and in frustum
      const visible = inFrustum && tmpVec.current.z < 1;

      positions[id] = { x, y, visible };
    });

    onPositionsUpdate(positions);
  });

  return null;
}

/* ─────────────────────────────────────────────
   Post-processing stack
───────────────────────────────────────────── */
interface PostFXProps {
  fx: FXState;
}

function PostFX({ fx }: PostFXProps) {
  return (
    <EffectComposer multisampling={4}>
      {fx.bloom ? (
        <Bloom
          intensity={fx.bloomIntensity}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.6}
          mipmapBlur
        />
      ) : <></>}

      {fx.dof ? (
        <DepthOfField
          focusDistance={fx.dofFocusDistance}
          focalLength={0.06}
          bokehScale={fx.dofBokehScale}
        />
      ) : <></>}

      {fx.colorGrading ? (
        <>
          <HueSaturation saturation={fx.saturation - 1} />
          <BrightnessContrast brightness={fx.exposure - 1} contrast={0.05} />
        </>
      ) : <></>}

      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

/* ─────────────────────────────────────────────
   Scene lighting
───────────────────────────────────────────── */
function Lighting() {
  return (
    <>
      {/* Key light */}
      <directionalLight
        position={[3, 5, 3]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={10}
        shadow-camera-left={-3}
        shadow-camera-right={1}
        shadow-camera-top={1}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
      />
      {/* Fill light */}
      <directionalLight position={[-3, 2, -2]} intensity={0.8} color="#b8d4ff" />
      {/* Rim light */}
      <directionalLight position={[0, -1, -4]} intensity={0.5} color="#ffe8c0" />
      {/* Ambient */}
      <ambientLight intensity={0.4} />
    </>
  );
}

/* ─────────────────────────────────────────────
   Root scene component (exported)
───────────────────────────────────────────── */
interface BagSceneProps {
  modelUrl: string;
  activeCamera: CameraPreset;
  flyingTo: string | null;
  hotspots: HotspotDef[];
  fx: FXState;
  onHotspotPositionsUpdate: (
    positions: Record<string, { x: number; y: number; visible: boolean }>
  ) => void;
}

// Preload as soon as the module is imported — starts fetching before Canvas mounts
useGLTF.preload('/bag.glb');

export default function BagScene({
  modelUrl,
  activeCamera,
  flyingTo,
  hotspots,
  fx,
  onHotspotPositionsUpdate,
}: BagSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const flyTarget = flyingTo
    ? (() => {
        const hs = hotspots.find((h) => h.id === flyingTo);
        if (!hs) return null;
        return {
          position: new THREE.Vector3(...hs.cameraPosition),
          target: new THREE.Vector3(...hs.cameraTarget),
        };
      })()
    : null;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.3, 2.8], fov: 50, near: 0.05, far: 50 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ background: 'transparent' }}
    >
      {/* Environment IBL */}
      <Environment preset="studio" backgroundBlurriness={1} />

      {/* Lights */}
      <Lighting />

      

      {/* Ground shadow */}
      {/* <ContactShadows
        position={[0, -0.85, 0]}
        opacity={0.55}
        scale={4}
        blur={2.5}
        far={2}
        color="#000022"
      /> */}

      {/* Bag model */}
      <Suspense fallback={null}>
        <BagModel url={modelUrl} />
      </Suspense>

      {/* Camera rig + orbit */}
      <CameraRig
        preset={activeCamera}
        flyTarget={flyTarget}
        controlsRef={controlsRef}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        enableDamping={false}
        minDistance={0.8}
        maxDistance={6}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        makeDefault
      />

      {/* Hotspot world → screen tracker */}
      <HotspotTracker
        hotspots={hotspots}
        onPositionsUpdate={onHotspotPositionsUpdate}
      />

      {/* Post-processing */}
      <PostFX fx={fx} />
    </Canvas>
  );
}