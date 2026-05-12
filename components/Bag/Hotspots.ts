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
      'SOFT-GRIP LEATHER HANDLES OR PAIR IT WITH A DETACHABLE LEATHER SHOULDER STRAP FOR VERSATILE CARRY OPTIONS.',
    position: [0, 0.6, 0.05],
    cameraTarget: [0, 0.65, 0],
    cameraPosition: [0.5, 1.4, 1.2],
    color: '#fff',
  },
  {
    id: 'zipper',
    label: 'YKK® ZIPPER SYSTEM',
    description:
      'PRECISION YKK® DOUBLE-SIDED ZIPPER ENGINEERED FOR SMOOTH, CONSISTENT GLIDE, FROM EITHER DIRECTION WITH ANTI-SNAG PERFORMANCE.',
    position: [0.65, -0.2, 0.32],
    cameraTarget: [0, 0.5, 0],
    cameraPosition: [1.4, -0.4, 0.1],
    color: '#fff',
  },
  {
    id: 'travel-friendly',
    label: 'TRAVEL FRIENDLY',
    description:
      'REAR LUGGAGE BAND DESIGNED TO SECURELY SLIDE OVER SUITCASE HANDLES, ENABLING EFFORTLESS TRAVEL.',
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
      'CRAFTED WITH TOP GRAIN LEATHER AND PANEL SPECIFIC REINFORCEMENTS. DESIGNED TO STAND THE TEST OF TIME.',
    position: [0, -0.62, 0.1],
    cameraTarget: [0, -0.52, 0],
    cameraPosition: [0.3, -0.3, 1.4],
    color: '#fff',
  },
];