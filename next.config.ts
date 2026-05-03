import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Vercel Cron will call /api/cron/cleanup every 5 minutes
  // vercel.json defines the cron schedule; Next.js routes handle the logic
  allowedDevOrigins: ["192.168.1.36", "localhost"],
};

export default nextConfig;
