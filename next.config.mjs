// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enables modern Next.js App Router features
  experimental: {
    appDir: true,
  },

  // If you plan to fetch from external APIs (like Gemini, Supabase, etc.)
  // you can whitelist their domains here for images or remote assets
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
