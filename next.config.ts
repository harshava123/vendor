import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint checks during production builds (handled separately in CI/local)
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'reportal-media.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'trullu-product-images.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      {
        protocol: 'http',
        hostname: 'bazarapi.elitceler.com',
      },
      {
        protocol: 'https',
        hostname: 'bazarapi.elitceler.com',
      },
    ],
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  // Enable static optimization where possible
  trailingSlash: false,
  // Handle API routes properly - only in production
  async rewrites() {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
        }
      ];
    }
    return [];
  }
};

export default nextConfig;