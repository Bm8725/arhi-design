// Adaugă (sau completează) în next.config.js / next.config.mjs,
// altfel next/image va da eroare de tip "hostname not configured"
// pentru pozele urcate în Supabase Storage.

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // ...restul configului tău existent
};

module.exports = nextConfig;