import type { NextConfig } from "next";

// jane: baseline security headers (issue #7). X-Content-Type-Options,
// Referrer-Policy, and X-Frame-Options enforce immediately (zero app impact:
// same-origin framing preserved, no sniffing-dependent loads in tree).
// The CSP ships Report-Only: generated apps import() blob: modules in the
// same document, so the enforced policy needs `blob:` in script-src, and dev
// HMR needs `unsafe-eval` - enforce only after verifying a prod build.
const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@anthropic-ai/claude-code'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'same-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' blob:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' ws: wss:",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              'form-action \'self\'',
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
