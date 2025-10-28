/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth'],
  },
  // Désactiver complètement la génération de pages statiques
  staticPageGenerationTimeout: 0,
  // Forcer le mode serveur uniquement
  webpack: (config, { isServer }) => {
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
    config.externals = config.externals || []
    config.externals.push({
      puppeteer: 'commonjs puppeteer',
      'puppeteer-extra': 'commonjs puppeteer-extra',
      'puppeteer-extra-plugin-stealth': 'commonjs puppeteer-extra-plugin-stealth',
    })
    // Désactiver Terser et les source maps
    config.optimization.minimize = false
    config.devtool = false // Désactiver les source maps
    return config
  },
  // Désactiver les optimisations qui causent des problèmes
  swcMinify: false,
  optimizeFonts: false,
  images: {
    unoptimized: true,
  },
  // Forcer le mode serveur
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
