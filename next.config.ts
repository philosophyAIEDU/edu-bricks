import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize for smaller build size
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons']
  },
  // Cloudflare Pages optimizations
  trailingSlash: false,
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // API routes will be handled by Cloudflare Workers
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
}

export default nextConfig;
