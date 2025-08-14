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
  trailingSlash: false,
}

export default nextConfig;
