import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  experimental: {
    webpackBuildWorker: false,
  },
  async redirects() {
    return [
      { source: '/cho-nc', destination: '/', permanent: false },
      { source: '/nong-san', destination: '/products?category=NONG_SAN', permanent: false },
    ];
  },
};

export default nextConfig;
