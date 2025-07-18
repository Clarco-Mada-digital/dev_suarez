/** @type {import('next').NextConfig} */
const path = require('path');

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
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/**',
      },
    ],
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
    // Ajoutez des alias pour les chemins d'importation
    config.resolve.alias['@'] = path.resolve(__dirname);
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'components');
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'lib');
    
    return config;
  },
  experimental: {
    swcMinify: true,
    swcTraceProfiling: true
  },
  // Configuration des redirections
  async redirects() {
    return [
      {
        source: '/sign-in',
        has: [
          {
            type: 'query',
            key: 'redirect_url',
          },
        ],
        destination: '/sign-in?redirect_url=:redirect_url',
        permanent: false,
      },
    ];
  },
};

// Configuration pour l'environnement de développement
if (process.env.NODE_ENV !== 'production') {
  nextConfig.images.domains = ['localhost'];
}

module.exports = nextConfig;
