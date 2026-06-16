import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org",
  "media-src 'self' blob: https://videos.pexels.com",
  "font-src 'self'",
  "connect-src 'self' https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://videos.pexels.com",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "worker-src 'self' blob:",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  devIndicators: false,
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.*.*",
    "10.*.*.*",
    "192.168.1.96",
    "192.168.2.11",
    "192.168.68.108",
  ],
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "videos.pexels.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/boat-rental-thassos",
        destination: "/rent-a-boat-thassos",
        permanent: true,
      },
      {
        source: "/fleet/pegasus-yacht",
        destination: "/fleet/kima",
        permanent: true,
      },
      {
        source: "/fleet/pegasus-cruiser",
        destination: "/fleet/kima",
        permanent: true,
      },
      {
        source: "/fleet/poseidon-400",
        destination: "/fleet/poseidon",
        permanent: true,
      },
      {
        source: "/fleet/aegean-spirit",
        destination: "/fleet/nikos",
        permanent: true,
      },
      {
        source: "/fleet/sapphire-bay",
        destination: "/fleet/niki",
        permanent: true,
      },
      {
        source: "/fleet/ionian-dream",
        destination: "/fleet/kima",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/",
        permanent: true,
      },
      {
        source: "/blog/:slug*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/matchmaker",
        destination: "/fleet",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
