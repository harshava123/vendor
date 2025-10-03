import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip ESLint checks during production builds (handled separately in CI/local)
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'reportal-media.s3.ap-south-1.amazonaws.com',
      'trullu-product-images.s3.ap-south-1.amazonaws.com', // AWS S3 bucket for uploads
      'images.unsplash.com', 
      'localhost',
      'bazarapi.elitceler.com', // Backend API domain
      // Production domains
      ...(process.env.NODE_ENV === 'production' ? [
        'your-aws-backend-domain.com',
        'your-aws-backend-domain.elasticbeanstalk.com',
        'your-aws-backend-domain.ec2.amazonaws.com'
      ] : ['localhost'])
    ].filter(Boolean),
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