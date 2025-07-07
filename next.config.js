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
      {
        protocol: 'https',
        hostname: 'randomuser.me',
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
  // Configuration pour Clerk
  clerk: {
    // Désactive la page de connexion intégrée pour utiliser notre propre page
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
  },
};

module.exports = nextConfig;
