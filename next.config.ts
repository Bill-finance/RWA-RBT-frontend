import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://http://43.134.99.111:8888/api/:path*", // 替换为你的实际后端服务地址
      },
    ];
  },
};

export default nextConfig;
