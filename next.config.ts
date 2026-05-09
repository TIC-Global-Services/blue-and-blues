import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    '@react-three/postprocessing',
    'postprocessing',
    'maath',
  ],
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
