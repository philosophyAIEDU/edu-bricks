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
  // Netlify deployment optimizations
  output: 'standalone',
  trailingSlash: false,
  // API routes configuration for Netlify
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/.netlify/functions/:path*',
      },
    ];
  },
}

export default nextConfig;
