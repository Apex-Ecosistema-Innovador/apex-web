import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
];

// CSP se genera por request en src/proxy.ts para poder aplicar nonce a
// script-src. style-src permite 'unsafe-inline' de forma deliberada: este sitio
// estático usa style={...} para degradados, delays, transforms y animaciones SVG
// en runtime, sin entrada de usuario ni backend que eleven el riesgo de CSS injection.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
