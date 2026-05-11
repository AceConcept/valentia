import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Hide the built-in dev-tools indicator; `<nextjs-portal>` is injected by Next in dev, not app code. */
  devIndicators: false,
};

export default nextConfig;
