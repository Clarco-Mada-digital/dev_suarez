/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/150/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuration expérimentale
  experimental: {
    swcMinify: true,
    swcTraceProfiling: true
  },
  // Configuration des chemins d'importation
  webpack: (config, { isServer }) => {
    // Important: ceci est nécessaire pour que les imports fonctionnent correctement
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
