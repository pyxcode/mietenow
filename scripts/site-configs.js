/**
 * Site-specific configurations for HTTP-only crawler
 * Provides custom selectors and patterns for different websites
 */

// Site configurations
const SITE_CONFIGS = {
  'wg-gesucht.de': {
    name: 'WG-Gesucht',
    listingSelectors: [
      'a[href*="/expose/"]',
      'a[href*="/wohnung/"]',
      'a[href*="/zimmer/"]'
    ],
    titleSelectors: [
      'h1',
      '.headline',
      '.title'
    ],
    priceSelectors: [
      '.price',
      '.rent',
      '.miete'
    ]
  },
  'immowelt.de': {
    name: 'ImmoWelt',
    listingSelectors: [
      'a[href*="/expose/"]',
      'a[href*="/wohnung/"]',
      'a[href*="/immobilie/"]'
    ],
    titleSelectors: [
      'h1',
      '.headline',
      '.title'
    ],
    priceSelectors: [
      '.price',
      '.rent',
      '.miete'
    ]
  },
  'immonet.de': {
    name: 'ImmoNet',
    listingSelectors: [
      'a[href*="/expose/"]',
      'a[href*="/wohnung/"]',
      'a[href*="/immobilie/"]'
    ],
    titleSelectors: [
      'h1',
      '.headline',
      '.title'
    ],
    priceSelectors: [
      '.price',
      '.rent',
      '.miete'
    ]
  },
  'kleinanzeigen.de': {
    name: 'eBay Kleinanzeigen',
    listingSelectors: [
      'a[href*="/s-anzeige/"]',
      'a[href*="/s-wohnung/"]'
    ],
    titleSelectors: [
      'h1',
      '.headline',
      '.title'
    ],
    priceSelectors: [
      '.price',
      '.rent',
      '.miete'
    ]
  },
  'immobilienscout24.de': {
    name: 'ImmobilienScout24',
    listingSelectors: [
      'a[href*="/expose/"]',
      'a[href*="/wohnung/"]',
      'a[href*="/immobilie/"]'
    ],
    titleSelectors: [
      'h1',
      '.headline',
      '.title'
    ],
    priceSelectors: [
      '.price',
      '.rent',
      '.miete'
    ]
  },
  'wohnen.de': {
    name: 'Wohnen.de',
    listingSelectors: [
      'a[href*="/expose/"]',
      'a[href*="/wohnung/"]',
      'a[href*="/immobilie/"]'
    ],
    titleSelectors: [
      'h1',
      '.headline',
      '.title'
    ],
    priceSelectors: [
      '.price',
      '.rent',
      '.miete'
    ]
  },
  'immopool.de': {
    name: 'Immopool',
    listingSelectors: [
      'a[href*="/expose/"]',
      'a[href*="/wohnung/"]',
      'a[href*="/immobilie/"]'
    ],
    titleSelectors: [
      'h1',
      '.headline',
      '.title'
    ],
    priceSelectors: [
      '.price',
      '.rent',
      '.miete'
    ]
  },
  'wohnungsboerse.net': {
    name: 'Wohnungsboerse',
    listingSelectors: [
      'a[href*="/expose/"]',
      'a[href*="/wohnung/"]',
      'a[href*="/immobilie/"]'
    ],
    titleSelectors: [
      'h1',
      '.headline',
      '.title'
    ],
    priceSelectors: [
      '.price',
      '.rent',
      '.miete'
    ]
  },
  'immotop.de': {
    name: 'ImmoTop',
    listingSelectors: [
      'a[href*="/expose/"]',
      'a[href*="/wohnung/"]',
      'a[href*="/immobilie/"]'
    ],
    titleSelectors: [
      'h1',
      '.headline',
      '.title'
    ],
    priceSelectors: [
      '.price',
      '.rent',
      '.miete'
    ]
  },
  'immowelt24.de': {
    name: 'Immowelt24',
    listingSelectors: [
      'a[href*="/expose/"]',
      'a[href*="/wohnung/"]',
      'a[href*="/immobilie/"]'
    ],
    titleSelectors: [
      'h1',
      '.headline',
      '.title'
    ],
    priceSelectors: [
      '.price',
      '.rent',
      '.miete'
    ]
  }
}

/**
 * Get site configuration for a given URL
 * @param {string} url - The website URL
 * @returns {Object|null} Site configuration or null if not found
 */
export function getSiteConfig(url) {
  if (!url) return null
  
  try {
    const domain = new URL(url).hostname.toLowerCase()
    
    // Find matching configuration
    for (const [configDomain, config] of Object.entries(SITE_CONFIGS)) {
      if (domain.includes(configDomain)) {
        return config
      }
    }
    
    return null
  } catch (error) {
    console.log(`⚠️ Error parsing URL for site config: ${url}`)
    return null
  }
}

/**
 * Get all available site configurations
 * @returns {Object} All site configurations
 */
export function getAllSiteConfigs() {
  return SITE_CONFIGS
}

/**
 * Check if a site has custom configuration
 * @param {string} url - The website URL
 * @returns {boolean} True if site has custom configuration
 */
export function hasSiteConfig(url) {
  return getSiteConfig(url) !== null
}