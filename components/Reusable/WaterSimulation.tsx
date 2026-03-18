"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree, extend, useFrame } from "@react-three/fiber";
import { Water } from "three/examples/jsm/objects/Water.js";

extend({ Water });

type WaterSurfaceProps = {
  width?: number;
  length?: number;
  dimensions?: number;
  waterColor?: number;
  distortionScale?: number;
  position?: [number, number, number];
};

export function WaterSurface({
  width = 190,
  length = 190,
  dimensions = 1024,
  waterColor = 0x000000,
  distortionScale = 3.7,
  position = [0, 0, 0],
  ...props
}: WaterSurfaceProps & React.ComponentProps<"group">) {
  const { scene } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const waterRef = useRef<any>(null);

  // Animate water
  useFrame((state, delta) => {
    if (waterRef.current?.material?.uniforms?.time) {
      waterRef.current.material.uniforms.time.value += delta;
    }
  });

  const waterNormals = new THREE.TextureLoader().load("/waternormal2.jpg", (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  });

  useEffect(() => {
    if (waterRef.current) {
      waterRef.current.position.set(...position);
      waterRef.current.rotation.x = -Math.PI / 2;
    }
  }, [position]);

  return (
    <group {...props}>
      {/* @ts-expect-error: Water is an extended object not recognized by TypeScript */}

      <water
        ref={waterRef}
        args={[
          new THREE.PlaneGeometry(width, length),
          {
            textureWidth: dimensions,
            textureHeight: dimensions,
            waterNormals,
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor,
            distortionScale,

            fog: scene.fog !== undefined,
          },
        ]}
      />
    </group>
  );
}