import type { NextConfig } from "next";

const securityHeaders = [
  // Anti-Clickjacking: evita que el portal sea embebido en un iframe malicioso
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Anti-MIME Sniffing: previene interpretación no autorizada de tipos de contenido
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Referrer Policy: previene filtración de datos de URL
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Permissions Policy: restringe APIs de hardware no autorizadas
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(self)",
  },
  // Strict Transport Security (HSTS): exige HTTPS en producción
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // X-XSS-Protection: defensa defensiva adicional para navegadores antiguos
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
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
