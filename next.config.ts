import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        destination: "https://coords.zone/api/v1/:endpoint",
        source: "/api/coords-zone/:endpoint"
      }
    ];
  }
};

export default nextConfig;
