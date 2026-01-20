/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable standalone output for Docker
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    // Avoid root ESLint plugin resolution issues during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
