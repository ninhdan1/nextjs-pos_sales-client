import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000", // hoặc để '*' nếu nhiều port
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
