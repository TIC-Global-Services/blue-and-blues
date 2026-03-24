import type { HotspotDef } from './types';

/**
 * Define your bag's hotspot world-space positions here.
 * Adjust position/cameraPosition/cameraTarget after loading your model.
 */
export const HOTSPOTS: HotspotDef[] = [
  {
    id: 'handle',
    label: 'Premium Handle',
    description:
      'Hand-stitched leather handle with reinforced double-wrap construction. Treated with natural oils for lasting durability and a buttery-soft grip.',
    position: [0, 0.6, 0.05],
    cameraTarget: [0, 0.65, 0],
    cameraPosition: [0.5, 1.4, 1.2],
    color: '#fff',
  },
  {
    id: 'zipper',
    label: 'YKK Zipper',
    description:
      'Precision YKK® No.10 zipper with custom metal pull. Engineered for 100,000+ open/close cycles with smooth glide and anti-snag teeth.',
    position: [0.65, -0.2, 0.32],
    cameraTarget: [0, 0.5, 0],
    cameraPosition: [1.4, -0.4, 0.1],
    color: '#fff',
  },
   {
    id: 'logo',
    label: 'Brand',
    description:
      'Solid brass logo plate, hand-polished and lacquered to resist tarnish. Engraved with serial number on the reverse.',
    position: [0.08, 0.05, 0.42],
    cameraTarget: [0.08, 0.05, -0.42],
    cameraPosition: [0.08, 0.05, 0.6],
    color: '#fff',
  },
  {
    id: 'base',
    label: 'Protective Base',
    description:
      'Reinforced rubber feet on a steel-strutted base panel. Keeps the bag upright and protects the leather from abrasion on any surface.',
    position: [0, -0.62, 0.1],
    cameraTarget: [0, -0.52, 0],
    cameraPosition: [0.3, -0.3, 1.4],
    color: '#fff',
  },
];