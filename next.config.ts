import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Disable experimental features that cause warnings
  experimental: {
    // Add if needed
  },
};

export default nextConfig;