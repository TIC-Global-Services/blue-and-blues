"use client";

import { useRef, useEffect, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  useTexture,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  ToneMapping,
  HueSaturation,
  BrightnessContrast,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import {
  Mesh,
  PerspectiveCamera,
  Plane,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  Vector3,
  Vector4,
  Matrix4,
  WebGLRenderTarget,
  HalfFloatType,
  Color,
  FrontSide,
  PlaneGeometry,
} from "three";
import { easing } from "maath";
import type { HotspotDef } from "./types";
import type { FXState, CameraPreset } from "./BagViewer";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/* ─────────────────────────────────────────────
   Camera presets
───────────────────────────────────────────── */
const CAMERA_PRESETS: Record<
  CameraPreset,
  { position: THREE.Vector3; target: THREE.Vector3 }
> = {
  front: {
    position: new THREE.Vector3(0, 0.1, 3.3),
    target: new THREE.Vector3(0, 0, 0),
  },
  back: {
    position: new THREE.Vector3(0, 0.1, -2.5),
    target: new THREE.Vector3(0, 0, 0),
  },
  side: {
    position: new THREE.Vector3(2.5, 0.1, 0),
    target: new THREE.Vector3(0, 0, 0),
  },
  // top:   { position: new THREE.Vector3(0, 3.2, 0.5),  target: new THREE.Vector3(0, 0, 0) },
};

const WATER_Y = -0.7;

/* ─────────────────────────────────────────────
   Forked realistic water shader
   Adds on top of three/addons Water:
   • Depth-based colour (dark abyss → teal at surface)
   • Sub-surface scattering approximation
   • Foam / whitecap at wave crests
   • Micro-bubble shimmer
   • Soft edge fade so the plane doesn't hard-clip
   • Tunable reflectivity via uReflectivity
───────────────────────────────────────────── */
const realisticWaterShader = {
  uniforms: UniformsUtils.merge([
    UniformsLib["fog"],
    UniformsLib["lights"],
    {
      normalSampler: { value: null as THREE.Texture | null },
      mirrorSampler: { value: null as THREE.Texture | null },
      alpha: { value: 1.0 },
      time: { value: 0.0 },
      size: { value: 2.5 },
      distortionScale: { value: 0.5 }, // lower = cleaner reflection, bag shape visible
      textureMatrix: { value: new Matrix4() },
      sunColor: { value: new Color(0x99ccff) },
      sunDirection: { value: new Vector3(0.577, 0.577, 0.577) },
      eye: { value: new Vector3() },
      waterColor: { value: new Color(0x03080f) },
      // ── Extra realism uniforms ──
      uReflectivity: { value: 0.85 }, // 0=no reflection, 1=full mirror
      uFoamThreshold: { value: 0.72 }, // wave height above which foam appears
      uSSSColor: { value: new Color(0x162035) }, // matches gradient mid
      uDepthColor: { value: new Color(0x060c18) }, // matches gradient edge
      uSurfaceColor: { value: new Color(0x2a3f5f) }, // matches gradient top
      uFoamColor: { value: new Color(0x3a5a8a) }, // blue-toned foam
      uRippleSpeed: { value: 1.2 }, // how fast rings travel outward
      uRippleStrength: { value: 0.15 }, // how much radial rings perturb the normal
    },
  ]),

  vertexShader: /* glsl */ `
    uniform mat4  textureMatrix;
    uniform float time;

    varying vec4  mirrorCoord;
    varying vec4  worldPosition;
    varying float vWaveHeight; // pass wave "energy" to fragment

    #include <common>
    #include <fog_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>

    void main() {
      mirrorCoord  = modelMatrix * vec4(position, 1.0);
      worldPosition = mirrorCoord.xyzw;
      mirrorCoord  = textureMatrix * mirrorCoord;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // We can't actually displace vertices here without recomputing normals,
      // so we pass the raw UV energy so the fragment shader can simulate depth.
      vWaveHeight = 0.5; // placeholder — driven by noise in frag

      #include <beginnormal_vertex>
      #include <defaultnormal_vertex>
      #include <logdepthbuf_vertex>
      #include <fog_vertex>
      #include <shadowmap_vertex>
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D mirrorSampler;
    uniform float     alpha;
    uniform float     time;
    uniform float     size;
    uniform float     distortionScale;
    uniform sampler2D normalSampler;
    uniform vec3      sunColor;
    uniform vec3      sunDirection;
    uniform vec3      eye;
    uniform vec3      waterColor;

    // Realism extras
    uniform float uReflectivity;
    uniform float uFoamThreshold;
    uniform vec3  uSSSColor;
    uniform vec3  uDepthColor;
    uniform vec3  uSurfaceColor;
    uniform vec3  uFoamColor;
    uniform float uRippleSpeed;
    uniform float uRippleStrength;

    varying vec4  mirrorCoord;
    varying vec4  worldPosition;

    /* ── Layered noise for organic wave shape ── */
    vec4 getNoise(vec2 uv) {
      vec2 uv0 = (uv / 103.0) + vec2(time / 17.0,  time / 29.0);
      vec2 uv1 =  uv / 107.0  - vec2(time / -19.0, time / 31.0);
      vec2 uv2 =  uv / vec2(8907.0, 9803.0) + vec2(time / 101.0, time / 97.0);
      vec2 uv3 =  uv / vec2(1091.0, 1027.0) - vec2(time / 109.0, time / -113.0);
      return (
        texture2D(normalSampler, uv0) +
        texture2D(normalSampler, uv1) +
        texture2D(normalSampler, uv2) +
        texture2D(normalSampler, uv3)
      ) * 0.5 - 1.0;
    }

    /* ── Extra high-freq ripple noise for micro detail ── */
    vec4 getMicroNoise(vec2 uv) {
      vec2 uv0 = uv / 12.0 + vec2(time * 0.08, time * 0.05);
      vec2 uv1 = uv / 8.0  - vec2(time * 0.06, time * 0.09);
      return (texture2D(normalSampler, uv0) + texture2D(normalSampler, uv1)) * 0.5 - 1.0;
    }

    /* ── Radial rings from bag base at world origin ── */
    // Returns a vec2 normal offset in xz that pushes normals outward in rings
    vec2 getRadialRipple(vec2 worldXZ) {
      float dist  = length(worldXZ) + 0.001; // distance from bag base
      vec2  dir   = worldXZ / dist;           // outward direction

      // Three concentric ring frequencies, each decaying with distance
      float decay = exp(-dist * 0.55);        // energy falls off from centre
      float r1 = sin(dist * 3.8 - time * uRippleSpeed * 1.0) * decay;
      float r2 = sin(dist * 7.2 - time * uRippleSpeed * 1.6) * decay * 0.5;
      float r3 = sin(dist * 1.5 - time * uRippleSpeed * 0.6) * decay * 0.7;

      return dir * (r1 + r2 + r3) * uRippleStrength;
    }


    /* ── Specular from sun ── */
    void sunLight(
      const vec3 surfNorm, const vec3 eyeDir,
      float shiny, float spec, float diffuse,
      inout vec3 diffCol, inout vec3 specCol
    ) {
      vec3  refl = normalize(reflect(-sunDirection, surfNorm));
      float dir  = max(0.0, dot(eyeDir, refl));
      specCol  += pow(dir, shiny) * sunColor * spec;
      diffCol  += max(dot(sunDirection, surfNorm), 0.0) * sunColor * diffuse;
    }

    #include <common>
    #include <packing>
    #include <bsdfs>
    #include <fog_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <lights_pars_begin>
    #include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>

    void main() {
      #include <logdepthbuf_fragment>

      vec2 wPos = worldPosition.xz * size;

      /* ── Surface normal from layered noise ── */
      vec4 noise      = getNoise(wPos);
      vec4 microNoise = getMicroNoise(wPos * 3.0);
      // Blend macro + micro normals
      // Radial ripple normal offset from bag centre
      vec2 rippleOffset = getRadialRipple(worldPosition.xz);
      vec3 surfNorm = normalize(
        (noise.xzy * vec3(1.5, 1.0, 1.5)) * 0.75 +
        (microNoise.xzy * vec3(1.0, 1.0, 1.0)) * 0.25 +
        vec3(rippleOffset.x, 0.0, rippleOffset.y)
      );

      /* ── Lighting ── */
      vec3 diffuseLight  = vec3(0.0);
      vec3 specularLight = vec3(0.0);
      vec3 worldToEye    = eye - worldPosition.xyz;
      vec3 eyeDir        = normalize(worldToEye);
      float dist         = length(worldToEye);

      // Primary sharp specular (sun glint)
      sunLight(surfNorm, eyeDir, 220.0, 2.5, 0.4, diffuseLight, specularLight);
      // Secondary broad specular (sky fill)
      sunLight(surfNorm, eyeDir,  12.0, 0.4, 0.1, diffuseLight, specularLight);

      /* ── Fresnel reflectance ── */
      float cosTheta  = max(dot(eyeDir, surfNorm), 0.0);
      float rf0       = 0.02; // lower base = more reflective at all angles
      float fresnel   = rf0 + (1.0 - rf0) * pow(1.0 - cosTheta, 4.0);
      // Apply user reflectivity scale — boosted multiplier for clear bag reflection
      fresnel *= uReflectivity * 3.5;
      fresnel  = clamp(fresnel, 0.0, 1.0);

      /* ── Mirror reflection sample ── */
     vec2 distortion = surfNorm.xz * (0.001 + 1.0 / dist) * distortionScale;
vec3 reflSample = texture2D(mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion).rgb;
      // Keep reflection bright so the bag is clearly visible
      reflSample *= 1.0;

      /* ── Depth-based water colour ── */
      // Simulate depth: near the bag base (centre) = darker, edges can be lit
      float depthFactor = clamp(length(worldPosition.xz) / 5.0, 0.0, 1.0);
      vec3  waterBody   = mix(uDepthColor, uSurfaceColor, depthFactor * 0.6);

      /* ── Sub-surface scattering approximation ── */
      // Light passing through the water from above, scattered sideways
      float sss = pow(max(dot(sunDirection, -eyeDir), 0.0), 3.0) * 0.5;
      sss      += pow(max(dot(surfNorm, sunDirection), 0.0), 2.0) * 0.3;
      waterBody = mix(waterBody, uSSSColor, sss * 0.35);

      /* ── Foam / whitecap on wave crests ── */
      // Use the noise magnitude as a proxy for wave crest height
      float waveEnergy = length(noise.xz);
      float foam       = smoothstep(uFoamThreshold, 1.0, waveEnergy);
      // Extra micro-foam from high-freq noise
      float microFoam  = smoothstep(0.85, 1.0, length(microNoise.xz)) * 0.4;
      foam = clamp(foam + microFoam, 0.0, 1.0);

      /* ── Caustic shimmer ── */
      // Bright flicker where crest normal faces sun directly
      float caustic = pow(max(dot(surfNorm, sunDirection), 0.0), 18.0)
                    * (0.5 + 0.5 * sin(waveEnergy * 40.0 - time * 6.0))
                    * 0.25;

      /* ── Compose ── */
      // Base: deep water scatter
      vec3 scatter = (diffuseLight * 0.25 + waterBody) * getShadowMask();
      // Blend reflection over scatter via Fresnel
      vec3 colour  = mix(scatter, reflSample + specularLight, fresnel);
      // Add sub-surface scatter rim
      colour += uSSSColor * sss * 0.12;
      // Add caustic twinkle
      colour += sunColor * caustic;
      // Blend foam on top — foam breaks up the too-perfect look
      colour  = mix(colour, uFoamColor * (diffuseLight * 0.5 + 0.5), foam * 0.55);

      /* ── Soft edge fade (avoids hard plane clip) ── */
      float edgeFade = 1.0 - smoothstep(7.0, 10.0, length(worldPosition.xz));

      gl_FragColor = vec4(colour, alpha * edgeFade);

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }
  `,
};

/* ─────────────────────────────────────────────
   WaterPlane — uses forked shader + planar mirror
───────────────────────────────────────────── */
function WaterPlane() {
  const meshRef = useRef<Mesh | null>(null);
  const matRef = useRef<ShaderMaterial | null>(null);
  const { scene, gl } = useThree();
  const normalMap = useTexture("/waternormal4.jpg");

  // Mirror camera internals
  const mirrorCamera = useRef(new PerspectiveCamera());
  const renderTarget = useRef(
    new WebGLRenderTarget(512, 512, { type: HalfFloatType }),
  );
  const textureMatrix = useRef(new Matrix4());
  const mirrorPlane = useRef(new Plane());
  const normal = useRef(new Vector3());
  const mirrorWorldPos = useRef(new Vector3());
  const cameraWorldPos = useRef(new Vector3());
  const rotMat = useRef(new Matrix4());
  const lookAtPos = useRef(new Vector3(0, 0, -1));
  const clipPlane = useRef(new Vector4());
  const view = useRef(new Vector3());
  const target = useRef(new Vector3());
  const q = useRef(new Vector4());

  useEffect(() => {
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;

    const geometry = new PlaneGeometry(20, 20, 1, 1);

    const material = new ShaderMaterial({
      name: "RealisticWater",
      uniforms: UniformsUtils.clone(realisticWaterShader.uniforms),
      vertexShader: realisticWaterShader.vertexShader,
      fragmentShader: realisticWaterShader.fragmentShader,
      lights: true,
      side: FrontSide,
      fog: false,
      transparent: true,
      depthWrite: false,
    });

    material.uniforms["mirrorSampler"].value = renderTarget.current.texture;
    material.uniforms["textureMatrix"].value = textureMatrix.current;
    material.uniforms["normalSampler"].value = normalMap;

    const mesh = new Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = WATER_Y;
    mesh.name = "water";

    scene.add(mesh);
    meshRef.current = mesh;
    matRef.current = material;

    return () => {
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderTarget.current.dispose();
    };
  }, [scene, normalMap]);

  useFrame(({ camera, clock }, delta) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    // ── Advance time ──
    mat.uniforms["time"].value += delta * 0.55;
    mat.uniforms["size"].value = 2.5;
    mat.uniforms["uRippleSpeed"].value = 1.2; // rings travel speed
    mat.uniforms["uRippleStrength"].value = 0.55; // ring normal intensity

    // ── Update eye position ──
    mat.uniforms["eye"].value.setFromMatrixPosition(camera.matrixWorld);

    // ── Compute planar mirror ──
    mirrorWorldPos.current.setFromMatrixPosition(mesh.matrixWorld);
    cameraWorldPos.current.setFromMatrixPosition(camera.matrixWorld);
    rotMat.current.extractRotation(mesh.matrixWorld);

    normal.current.set(0, 0, 1);
    normal.current.applyMatrix4(rotMat.current);

    view.current.subVectors(mirrorWorldPos.current, cameraWorldPos.current);
    if (view.current.dot(normal.current) > 0) return; // facing away

    view.current.reflect(normal.current).negate();
    view.current.add(mirrorWorldPos.current);

    rotMat.current.extractRotation(camera.matrixWorld);
    lookAtPos.current.set(0, 0, -1);
    lookAtPos.current.applyMatrix4(rotMat.current);
    lookAtPos.current.add(cameraWorldPos.current);

    target.current.subVectors(mirrorWorldPos.current, lookAtPos.current);
    target.current.reflect(normal.current).negate();
    target.current.add(mirrorWorldPos.current);

    const mc = mirrorCamera.current;
    mc.position.copy(view.current);
    mc.up.set(0, 1, 0);
    mc.up.applyMatrix4(rotMat.current);
    mc.up.reflect(normal.current);
    mc.lookAt(target.current);
    mc.far = camera.far;
    mc.updateMatrixWorld();
    mc.projectionMatrix.copy((camera as PerspectiveCamera).projectionMatrix);

    textureMatrix.current.set(
      0.5,
      0,
      0,
      0.5,
      0,
      0.5,
      0,
      0.5,
      0,
      0,
      0.5,
      0.5,
      0,
      0,
      0,
      1,
    );
    textureMatrix.current.multiply(mc.projectionMatrix);
    textureMatrix.current.multiply(mc.matrixWorldInverse);

    mirrorPlane.current.setFromNormalAndCoplanarPoint(
      normal.current,
      mirrorWorldPos.current,
    );
    mirrorPlane.current.applyMatrix4(mc.matrixWorldInverse);

    const cp = clipPlane.current;
    const mp = mirrorPlane.current;
    cp.set(mp.normal.x, mp.normal.y, mp.normal.z, mp.constant);

    const pm = mc.projectionMatrix;
    q.current.x = (Math.sign(cp.x) + pm.elements[8]) / pm.elements[0];
    q.current.y = (Math.sign(cp.y) + pm.elements[9]) / pm.elements[5];
    q.current.z = -1.0;
    q.current.w = (1.0 + pm.elements[10]) / pm.elements[14];

    cp.multiplyScalar(2.0 / cp.dot(q.current));
    pm.elements[2] = cp.x;
    pm.elements[6] = cp.y;
    pm.elements[10] = cp.z + 1.0 - 0.001; // clipBias
    pm.elements[14] = cp.w;

    // ── Render mirror pass ──
    const currentRT = gl.getRenderTarget();
    mesh.visible = false;
    gl.setRenderTarget(renderTarget.current);
    gl.state.buffers.depth.setMask(true);
    gl.clear();
    gl.render(scene, mc);
    mesh.visible = true;
    gl.setRenderTarget(currentRT);
  });

  return null;
}

/* ─────────────────────────────────────────────
   Bag mesh
───────────────────────────────────────────── */
function BagModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          mats.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.envMapIntensity = 1.2;
              mat.needsUpdate = true;
            }
          });
        }
      }
    });

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const scale = 1.6 / Math.max(size.x, size.y, size.z);
    scene.scale.setScalar(scale);
    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
    scene.position.sub(center);
  }, [scene]);

  return <primitive object={scene} />;
}

/* ─────────────────────────────────────────────
   Camera rig
───────────────────────────────────────────── */
function CameraRig({
  preset,
  flyTarget,
  controlsRef,
}: {
  preset: CameraPreset;
  flyTarget: { position: THREE.Vector3; target: THREE.Vector3 } | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    const dest = flyTarget ?? CAMERA_PRESETS[preset];
    targetPos.current.copy(dest.position);
    targetLookAt.current.copy(dest.target);
  }, [preset, flyTarget]);

  useFrame((_s, delta) => {
    easing.damp3(camera.position, targetPos.current, 0.35, delta);
    if (controlsRef.current) {
      easing.damp3(
        controlsRef.current.target,
        targetLookAt.current,
        0.35,
        delta,
      );
      controlsRef.current.update();
    }
  });

  return null;
}

/* ─────────────────────────────────────────────
   Hotspot tracker
───────────────────────────────────────────── */
function HotspotTracker({
  hotspots,
  onPositionsUpdate,
}: {
  hotspots: HotspotDef[];
  onPositionsUpdate: (
    p: Record<string, { x: number; y: number; visible: boolean }>,
  ) => void;
}) {
  const { camera, size } = useThree();
  const tmpVec = useRef(new THREE.Vector3());
  const frustum = useRef(new THREE.Frustum());
  const projMatrix = useRef(new THREE.Matrix4());

  useFrame(() => {
    projMatrix.current.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
    frustum.current.setFromProjectionMatrix(projMatrix.current);
    const positions: Record<
      string,
      { x: number; y: number; visible: boolean }
    > = {};
    hotspots.forEach(({ id, position }) => {
      tmpVec.current.set(...position);
      const inFrustum = frustum.current.containsPoint(tmpVec.current);
      tmpVec.current.project(camera);
      positions[id] = {
        x: (tmpVec.current.x * 0.5 + 0.5) * size.width,
        y: (-tmpVec.current.y * 0.5 + 0.5) * size.height,
        visible: inFrustum && tmpVec.current.z < 1,
      };
    });
    onPositionsUpdate(positions);
  });

  return null;
}

/* ─────────────────────────────────────────────
   Post FX
───────────────────────────────────────────── */
function PostFX({ fx }: { fx: FXState }) {
  return (
    <EffectComposer multisampling={4}>
      {fx.bloom ? (
        <Bloom
          intensity={fx.bloomIntensity}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.6}
          mipmapBlur
        />
      ) : (
        <></>
      )}
      {fx.dof ? (
        <DepthOfField
          focusDistance={fx.dofFocusDistance}
          focalLength={0.06}
          bokehScale={fx.dofBokehScale}
        />
      ) : (
        <></>
      )}
      {fx.colorGrading ? (
        <>
          <HueSaturation saturation={fx.saturation - 1} />
          <BrightnessContrast brightness={fx.exposure - 1} contrast={0.05} />
        </>
      ) : (
        <></>
      )}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

/* ─────────────────────────────────────────────
   Lighting
───────────────────────────────────────────── */
function Lighting() {
  return (
    <>
      <directionalLight
        position={[3, 5, 3]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={10}
        shadow-camera-left={-3}
        shadow-camera-right={10}
        shadow-camera-top={1}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
      />
      <directionalLight
        position={[-3, 2, -2]}
        intensity={0.8}
        color="#b8d4ff"
      />
      <directionalLight
        position={[0, -1, -4]}
        intensity={0.5}
        color="#ffe8c0"
      />
      <ambientLight intensity={1} />
    </>
  );
}

/* ─────────────────────────────────────────────
   Root export
───────────────────────────────────────────── */
useGLTF.preload("/bag.glb");

export default function BagScene({
  modelUrl,
  activeCamera,
  flyingTo,
  hotspots,
  fx,
  onHotspotPositionsUpdate,
}: {
  modelUrl: string;
  activeCamera: CameraPreset;
  flyingTo: string | null;
  hotspots: HotspotDef[];
  fx: FXState;
  onHotspotPositionsUpdate: (
    positions: Record<string, { x: number; y: number; visible: boolean }>,
  ) => void;
}) {
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
        toneMappingExposure: 0.8,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ background: "transparent" }}
    >
      <Environment preset="studio" backgroundBlurriness={1} />
      <Lighting />

      <Suspense fallback={null}>
        <BagModel url={modelUrl} />
      </Suspense>

      <WaterPlane />

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

      <HotspotTracker
        hotspots={hotspots}
        onPositionsUpdate={onHotspotPositionsUpdate}
      />
      <PostFX fx={fx} />
    </Canvas>
  );
}
