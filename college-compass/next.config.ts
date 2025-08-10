import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['openai'],
  },
  
  // Optimize images and static assets
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable compression for better performance
  compress: true,
  
  // Production optimizations
  // swcMinify is enabled by default in Next.js 13+
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
