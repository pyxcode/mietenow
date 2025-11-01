/**
 * Configuration centralisée des sites à scraper
 * Liste des sites avec leurs URLs et métadonnées
 */

/**
 * Extrait le nom du provider depuis une URL
 * @param {string} url - URL du site
 * @returns {string} Nom du provider (ex: 'wg-gesucht', 'immowelt')
 */
function extractProviderFromUrl(url) {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Retirer 'www.' si présent
    const domain = hostname.replace(/^www\./, '')
    
    // Mapping des domaines vers les noms de providers
    const providerMap = {
      'wg-gesucht.de': 'wg-gesucht',
      'immowelt.de': 'immowelt',
      'immonet.de': 'immonet',
      'kleinanzeigen.de': 'kleinanzeigen',
      'immobilienscout24.de': 'immoscout',
      'immopool.de': 'immopool',
      'wohnungsboerse.net': 'wohnungsboerse'
    }
    
    // Chercher le domaine dans le mapping
    for (const [domainKey, provider] of Object.entries(providerMap)) {
      if (domain.includes(domainKey)) {
        return provider
      }
    }
    
    // Si pas trouvé, extraire le premier segment du domaine
    const parts = domain.split('.')
    return parts[0] || 'unknown'
  } catch (error) {
    console.warn(`⚠️ Error extracting provider from URL: ${url}`, error)
    return 'unknown'
  }
}

/**
 * Extrait le nom du site depuis une URL
 * @param {string} url - URL du site
 * @returns {string} Nom lisible du site
 */
function extractNameFromUrl(url) {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    const domain = hostname.replace(/^www\./, '')
    
    // Mapping des domaines vers les noms lisibles
    const nameMap = {
      'wg-gesucht.de': 'WG-Gesucht',
      'immowelt.de': 'ImmoWelt',
      'immonet.de': 'ImmoNet',
      'kleinanzeigen.de': 'eBay Kleinanzeigen',
      'immobilienscout24.de': 'ImmobilienScout24',
      'immopool.de': 'Immopool',
      'wohnungsboerse.net': 'Wohnungsboerse'
    }
    
    for (const [domainKey, name] of Object.entries(nameMap)) {
      if (domain.includes(domainKey)) {
        return name
      }
    }
    
    // Fallback: capitaliser le premier segment
    const parts = domain.split('.')
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  } catch (error) {
    return 'Unknown Site'
  }
}

/**
 * Liste des sites à scraper avec leurs URLs exactes
 * URLs fournies par l'utilisateur pour garantir les bonnes pages
 */
export const SCRAPING_SITES = [
  {
    name: 'WG-Gesucht',
    url: 'https://www.wg-gesucht.de/wg-zimmer-und-1-zimmer-wohnungen-und-wohnungen-und-haeuser-in-Berlin.8.0+1+2+3.1.0.html?offer_filter=1&city_id=8&sort_order=0&noDeact=1&categories%5B%5D=0&categories%5B%5D=1&categories%5B%5D=2&categories%5B%5D=3',
    provider: 'wg-gesucht',
    type: 'rental',
    status: 'active'
  },
  {
    name: 'ImmoWelt',
    url: 'https://www.immowelt.de/suche/mieten/wohnung/berlin/berlin-10115/ad08de8634',
    provider: 'immowelt',
    type: 'rental',
    status: 'active'
  },
  {
    name: 'ImmoNet',
    url: 'https://www.immonet.de/suchen/miete/wohnung/berlin/berlin-10115/ad08de8634',
    provider: 'immonet',
    type: 'rental',
    status: 'active'
  },
  {
    name: 'eBay Kleinanzeigen',
    url: 'https://www.kleinanzeigen.de/s-wohnung-mieten/berlin/c203l3331#:~:text=Mietwohnungen%20in%20Berlin%201%20,442%20Mietwohnungen%20in%20Berlin',
    provider: 'kleinanzeigen',
    type: 'rental',
    status: 'active'
  },
  {
    name: 'ImmobilienScout24',
    url: 'https://www.immobilienscout24.de/Suche/de/berlin/berlin/wohnung-mieten',
    provider: 'immoscout',
    type: 'rental',
    status: 'active'
  },
  {
    name: 'Immopool',
    url: 'https://www.immopool.de/ASP/immo/obj/ImmoListe.asp?LASID=24492796&GrpO=2&SL=&BEZ=Wohnungen&AnbNr=&Firma=&PRArt=2&ORTArt=1&Land=D&GeoSL=004011000000000000&Waehr=EUR&Umkreis=on&Umkr_xy=568%2C8998%5F611%2C2315&Umkr_km=16',
    provider: 'immopool',
    type: 'rental',
    status: 'active'
  },
  {
    name: 'Wohnungsboerse',
    url: 'https://www.wohnungsboerse.net/Berlin/mieten/wohnungen#:~:text=Wohnen%20in%20Berlin',
    provider: 'wohnungsboerse',
    type: 'rental',
    status: 'active'
  }
]

/**
 * Exporte également TOP_10_SITES et TOP_20_SITES pour compatibilité
 * avec les scripts existants
 */
export const TOP_10_SITES = SCRAPING_SITES
export const TOP_20_SITES = SCRAPING_SITES

// Export des fonctions helper
export { extractProviderFromUrl, extractNameFromUrl }

