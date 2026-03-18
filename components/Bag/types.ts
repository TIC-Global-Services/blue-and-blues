import type * as THREE from 'three';

export interface HotspotDef {
  id: string;
  label: string;
  description: string;
  /** World-space position of the hotspot */
  position: [number, number, number];
  /** Camera target when flying to this hotspot */
  cameraTarget: [number, number, number];
  /** Camera position when flying to this hotspot */
  cameraPosition: [number, number, number];
  color?: string;
}

export interface ActiveHotspot {
  hotspot: HotspotDef;
  open: boolean;
}

export interface HotspotScreenPosition {
  x: number;
  y: number;
  visible: boolean;
}