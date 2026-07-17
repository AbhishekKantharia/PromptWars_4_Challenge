/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
    {
      source: '/api/sustainability',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=300, stale-while-revalidate=600' }],
    },
    {
      source: '/api/transport',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=120' }],
    },
    {
      source: '/api/crowd',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=10, stale-while-revalidate=30' }],
    },
    {
      source: '/api/health',
      headers: [{ key: 'Cache-Control', value: 'no-store' }],
    },
  ],
};

module.exports = nextConfig;
