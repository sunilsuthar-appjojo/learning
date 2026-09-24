import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    JWT_SECRET: process.env.JWT_SECRET || 'XCADcjdqB09xayVaRF96Lujn9mwyXK4XXsRD28KDobg=',
  },
};

export default nextConfig;
