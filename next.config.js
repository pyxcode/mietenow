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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
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
  // Configuration pour éviter les erreurs de build avec Puppeteer
  webpack: (config, { isServer }) => {
    // Exclure Puppeteer du build client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        puppeteer: false,
        'puppeteer-extra': false,
        'puppeteer-extra-plugin-stealth': false,
      }
    }
    
    // Configuration pour les modules Node.js
    config.externals = config.externals || []
    config.externals.push({
      puppeteer: 'commonjs puppeteer',
      'puppeteer-extra': 'commonjs puppeteer-extra',
      'puppeteer-extra-plugin-stealth': 'commonjs puppeteer-extra-plugin-stealth',
    })
    
    return config
  },
  // Configuration expérimentale pour éviter les erreurs
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth'],
    forceSwcTransforms: true,
  },
  // Configuration pour éviter les connexions DB pendant le build
  output: 'standalone',
  // Forcer le rendu dynamique pour éviter les erreurs de prerendering
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Désactiver la génération statique pour toutes les pages
  skipTrailingSlashRedirect: true,
  trailingSlash: false,
  // Forcer le rendu dynamique pour toutes les pages
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
