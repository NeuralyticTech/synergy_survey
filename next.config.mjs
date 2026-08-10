/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Pin the workspace root: there's a stray package-lock.json in the parent
  // tree that Turbopack would otherwise treat as the project root.
  turbopack: { root: import.meta.dirname },
  async headers() {
    return [
      {
        // Survey answers and results are private: never let a proxy or a
        // search engine hold on to them.
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/results/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/survey/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig
