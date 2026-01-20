import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "250mb",
    },
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://192.168.137.1:3000",
    "http://172.16.35.48:3000",
    "http://192.168.137.22:3000",
    "http://172.16.24.46:3000",
  ],

  // transpilePackages: ["@react-pdf/renderer"],
  // webpack: (config) => {
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     "@react-pdf/renderer": "@react-pdf/renderer",
  //   };
  //   return config;
  // },
};

export default nextConfig;
