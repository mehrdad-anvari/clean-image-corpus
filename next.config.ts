import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProduction ? '/clean-image-corpus' : '',
  assetPrefix: isProduction ? '/clean-image-corpus/' : '',
};

export default nextConfig;