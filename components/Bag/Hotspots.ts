import type { HotspotDef } from './types';

/**
 * Define your bag's hotspot world-space positions here.
 * Adjust position/cameraPosition/cameraTarget after loading your model.
 */
export const HOTSPOTS: HotspotDef[] = [
  {
    id: 'handle',
    label: 'PREMIUM CARRY SYSTEM',
    description:
      'Soft-grip leather handles, hand stitched with reinforced construction for comfort during extended use. Paired with a detachable leather shoulder strap for versatile carry options.',
    position: [0, 0.6, 0.05],
    cameraTarget: [0, 0.65, 0],
    cameraPosition: [0.5, 1.4, 1.2],
    color: '#fff',
  },
  {
    id: 'zipper',
    label: 'YKK® ZIPPER SYSTEM',
    description:
      'Precision YKK® double-sided zipper engineered for smooth, consistent glide. Allows easy access from either direction with anti-snag performance.',
    position: [0.65, -0.2, 0.32],
    cameraTarget: [0, 0.5, 0],
    cameraPosition: [1.4, -0.4, 0.1],
    color: '#fff',
  },
  {
    id: 'travel-friendly',
    label: 'TRAVEL FRIENDLY',
    description:
      'Integrated rear luggage band designed to securely slide over suitcase handles, enabling effortless movement during travel.',
    position: [0.08, 0.05, -0.42],
    cameraTarget: [0, 0.05, 0],
    cameraPosition: [0, 0.05, -1.4],
    color: '#fff',
    view: 'back',
  },
  {
    id: 'base',
    label: 'STRUCTURED CONSTRUCTION',
    description:
      'Constructed in top-grain leather with internal reinforcement, designed to retain its structure and stand the test of time. Engineered with panel-specific support materials, reinforced in key areas to maintain form, ensuring long-lasting structure and a refined aesthetic that not only endures, but evolves beautifully with age.',
    position: [0, -0.62, 0.1],
    cameraTarget: [0, -0.52, 0],
    cameraPosition: [0.3, -0.3, 1.4],
    color: '#fff',
  },
];