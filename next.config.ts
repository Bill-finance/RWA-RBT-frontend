import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/rwa/:path*",
        destination: "http://43.134.99.111:8888/rwa/:path*",
      },
    ];
  },
};

export default nextConfig;
