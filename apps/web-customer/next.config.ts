import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "local-dev-gateway.kplian.com",
      },
    ],
  },
  serverExternalPackages: ["lightningcss"],
  transpilePackages: ["@kplian/core", "@kplian/infrastructure", "@kplian/ui", "@kplian/store", "@kplian/i18n"],
  webpack: (config: any, { dev }: { dev: boolean }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
