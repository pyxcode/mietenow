/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  // Optimisation SEO
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Configuration pour le rendu côté serveur
  swcMinify: true,
  // Optimisation des performances
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
