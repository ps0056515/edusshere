import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Helps webpack/Turbopack emit consistent chunks for Auth.js on Windows after clean builds.
  transpilePackages: ["next-auth"],
};

export default nextConfig;
