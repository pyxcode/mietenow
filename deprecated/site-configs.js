/**
 * Site-Specific Configurations
 * Patterns d'extraction adaptés à chaque site
 */

const SITE_CONFIGS = {
  'wg-gesucht': {
    searchPagePattern: /wohnungen-in-\w+\.\d+\.\d+\.\d+\.\d+\.html/,
    listingUrlPatterns: [
      /\/\d+\.html/,  // /12345.html
      /\/anzeigen\/\d+/,
      /data-id="(\d+)"/,
    ],
    listingContainer: ['article', '[data-id]', '.panel-body'],
    titleSelectors: ['h1', '.headline', '.title'],
    priceSelectors: ['[class*="price"]', '[class*="miete"]', '.price'],
    surfaceSelectors: ['[class*="flat"]', '[class*="qm"]', '[class*="m²"]'],
    roomsSelectors: ['[class*="room"]', '[class*="zimmer"]'],
    imageSelectors: ['img[src*="wg-gesucht"]', '.image-gallery img'],
    descriptionSelectors: ['.panel-body', '.description', '.text'],
    extractListingUrls: (html, baseUrl) => {
      const urls = []
      // Pattern spécifique WG-Gesucht
      const matches = html.match(/data-id="(\d+)"/g)
      if (matches) {
        matches.forEach(match => {
          const id = match.match(/\d+/)[0]
          urls.push(`https://www.wg-gesucht.de/${id}.html`)
        })
      }
      return [...new Set(urls)]
    }
  },
  
  'immoscout': {
    searchPagePattern: /\/Suche\/.*\/wohnung-mieten/,
    listingUrlPatterns: [
      /\/expose\/\d+/,
      /\/Immobilien\/\d+/,
    ],
    listingContainer: ['.result-list-entry', '.result-item', 'article'],
    titleSelectors: ['h1', '[data-obid]'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[data-src]', '.gallery img'],
    descriptionSelectors: ['.is24-expose-details', '.description'],
  },
  
  'immowelt': {
    searchPagePattern: /\/suche\/.*\/wohnungen\/mieten/,
    listingUrlPatterns: [
      /\/expose\/[\w-]+/,
    ],
    listingContainer: ['.resultlist-item', '.card', 'article'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[data-src]', '.image img'],
    descriptionSelectors: ['.expose-description', '.description'],
  },
  
  'kleinanzeigen': {
    searchPagePattern: /\/s-wohnung-mieten\/.*\/c\d+l\d+/,
    listingUrlPatterns: [
      /\/s-anzeige\/.*\/\d+-\d+-\d+/,
    ],
    listingContainer: ['.ad-listitem', 'article', '[data-adid]'],
    titleSelectors: ['h2', '.ad-title'],
    priceSelectors: ['.ad-price', '[class*="price"]'],
    surfaceSelectors: ['.ad-details', '[class*="size"]'],
    roomsSelectors: ['.ad-details', '[class*="rooms"]'],
    imageSelectors: ['img[data-src]', '.ad-image img'],
    descriptionSelectors: ['.ad-description', '.description'],
  },
  
  'immonet': {
    searchPagePattern: /immobiliensuche/,
    listingUrlPatterns: [
      /\/objekt\/\d+/,
    ],
    listingContainer: ['.result-item', '.offer-item'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'immopool': {
    searchPagePattern: /\/immobilien\/wohnungen\/.*\/mieten/,
    listingUrlPatterns: [
      /\/immobilie\/\d+/,
    ],
    listingContainer: ['.result-item', '.property-item'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'wohnen': {
    searchPagePattern: /\/immobilien\/mieten\/.*\/wohnung/,
    listingUrlPatterns: [
      /\/wohnung\/\d+/,
    ],
    listingContainer: ['.result-item', '.listing-item'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'housinganywhere': {
    searchPagePattern: /\/s\/.*-Germany/,
    listingUrlPatterns: [
      /\/room\/[\w-]+/,
      /\/listing\/[\w-]+/,
    ],
    listingContainer: ['.property-card', '.listing-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'nestpick': {
    searchPagePattern: /\/[\w-]+/,
    listingUrlPatterns: [
      /\/rooms-for-rent\/[\w-]+/,
    ],
    listingContainer: ['.property-card', '.listing-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'spotahome': {
    searchPagePattern: /\/[\w-]+/,
    listingUrlPatterns: [
      /\/property\/[\w-]+/,
    ],
    listingContainer: ['.property-card', '.listing-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'wimdu': {
    searchPagePattern: /\/wohnungen\/[\w-]+/,
    listingUrlPatterns: [
      /\/room\/[\w-]+/,
    ],
    listingContainer: ['.property-card', '.listing-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'mrlodge': {
    searchPagePattern: /\/rentals\/[\w-]+/,
    listingUrlPatterns: [
      /\/property\/[\w-]+/,
    ],
    listingContainer: ['.property-card', '.listing-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'urbanground': {
    searchPagePattern: /\/[\w-]+/,
    listingUrlPatterns: [
      /\/property\/[\w-]+/,
    ],
    listingContainer: ['.property-card', '.listing-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'habyt': {
    searchPagePattern: /\/[\w-]+/,
    listingUrlPatterns: [
      /\/property\/[\w-]+/,
    ],
    listingContainer: ['.property-card', '.listing-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'student': {
    searchPagePattern: /\/[\w-]+/,
    listingUrlPatterns: [
      /\/property\/[\w-]+/,
    ],
    listingContainer: ['.property-card', '.listing-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'campusgroups': {
    searchPagePattern: /\/housing\/[\w-]+/,
    listingUrlPatterns: [
      /\/listing\/[\w-]+/,
    ],
    listingContainer: ['.listing-card', '.property-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'studocu': {
    searchPagePattern: /\/housing\/[\w-]+/,
    listingUrlPatterns: [
      /\/listing\/[\w-]+/,
    ],
    listingContainer: ['.listing-card', '.property-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'berlinapartments': {
    searchPagePattern: /.*/,
    listingUrlPatterns: [
      /\/apartment\/[\w-]+/,
    ],
    listingContainer: ['.apartment-card', '.property-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'berolina': {
    searchPagePattern: /\/[\w-]+/,
    listingUrlPatterns: [
      /\/property\/[\w-]+/,
    ],
    listingContainer: ['.property-card', '.listing-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  },
  
  'crocodilian': {
    searchPagePattern: /\/[\w-]+/,
    listingUrlPatterns: [
      /\/property\/[\w-]+/,
    ],
    listingContainer: ['.property-card', '.listing-card'],
    titleSelectors: ['h1', '.title'],
    priceSelectors: ['.price', '[class*="price"]'],
    surfaceSelectors: ['.area', '[class*="area"]'],
    roomsSelectors: ['.rooms', '[class*="rooms"]'],
    imageSelectors: ['img[src]', '.image img'],
    descriptionSelectors: ['.description', '.content'],
  }
}

/**
 * Trouve la configuration pour un site donné
 */
export function getSiteConfig(url) {
  const urlLower = url.toLowerCase()
  
  for (const [key, config] of Object.entries(SITE_CONFIGS)) {
    if (urlLower.includes(key.replace('-', '').replace('_', ''))) {
      return config
    }
  }
  
  // Essayer de détecter par patterns
  for (const [key, config] of Object.entries(SITE_CONFIGS)) {
    if (config.searchPagePattern && config.searchPagePattern.test(url)) {
      return config
    }
  }
  
  return null
}

/**
 * Charge une configuration depuis un fichier JSON
 */
export async function loadSiteConfigFromFile(siteName) {
  try {
    const config = await import(`./site-configs/${siteName}.json`, { assert: { type: 'json' } })
    return config.default
  } catch (error) {
    return null
  }
}

export default SITE_CONFIGS

