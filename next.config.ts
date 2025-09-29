import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'reportal-media.s3.ap-south-1.amazonaws.com', 
      'images.unsplash.com', 
      'localhost',
      // Add your production domain here
      process.env.NODE_ENV === 'production' ? 'your-production-domain.com' : 'localhost'
    ].filter(Boolean),
  },
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;