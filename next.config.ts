import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["puppeteer", "@sparticuz/chromium"],
};

export default nextConfig;