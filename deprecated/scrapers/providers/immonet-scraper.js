/**
 * Immonet Scraper
 */

import { BaseScraper } from '../core/base-scraper.js'

export class ImmonetScraper extends BaseScraper {
  constructor() {
    super('immonet')
    this.url = 'https://www.immonet.de/immobilien/wohnung-mieten/berlin?sort=relevanz'
    this.headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    }
  }

  async scrape() {
    try {
      // Utiliser des headers personnalisés pour éviter la détection de bot
      const html = await this.fetchPageWithBrowserless(this.url, this.headers)
      if (!html) return []

      const listings = this.extractListings(html)
      console.log(`✅ ${this.platformName}: ${listings.length} listings found`)
      
      // Enrichir avec les coordonnées géographiques
      const enrichedListings = await this.enrichListingsWithCoordinates(listings)
      
      return enrichedListings.map(listing => this.normalizeListing(listing))
    } catch (error) {
      console.error(`❌ ${this.platformName}: Scraping failed:`, error.message)
      return []
    }
  }

  extractListings(html) {
    const listings = []
    
    // Essayer plusieurs approches pour trouver les annonces Immonet
    const patterns = [
      // Pattern 1: Liens avec /immobilien/
      /<a[^>]*href="[^"]*\/immobilien\/[^"]*"[^>]*>/gi,
      // Pattern 2: Liens avec /expose/
      /<a[^>]*href="[^"]*\/expose\/[^"]*"[^>]*>/gi,
      // Pattern 3: Liens avec data-testid
      /<a[^>]*data-testid="[^"]*"[^>]*>/gi,
      // Pattern 4: Liens génériques d'annonces
      /<a[^>]*href="[^"]*\/[a-f0-9-]+[^"]*"[^>]*>/gi
    ]
    
    let links = []
    for (const pattern of patterns) {
      const matches = html.match(pattern)
      if (matches && matches.length > 0) {
        links = matches
        console.log(`Found ${links.length} Immonet links with pattern ${patterns.indexOf(pattern) + 1}`)
        break
      }
    }
    
    if (links.length === 0) {
      console.log('No Immonet links found with any pattern')
      return listings
    }
    
    for (let i = 0; i < links.length; i++) {
      const link = links[i]
      
      try {
        const listing = this.extractListingFromLink(link, i)
        if (listing) {
          listings.push(listing)
        }
      } catch (error) {
        console.warn(`   - Error processing link ${i}: ${error.message}`)
      }
    }
    
    return listings
  }

  extractListingFromLink(link, index) {
    // Extraire le lien
    const linkMatch = link.match(/href="([^"]+)"/i)
    const href = linkMatch ? linkMatch[1] : null
    
    // Construire l'URL complète
    const linkUrl = href ? 
      (href.startsWith('http') ? href : `https://www.immonet.de${href}`) : 
      null
    
    // Extraire le titre depuis l'attribut title ou le contenu
    const titleMatch = link.match(/title="([^"]+)"/i) || link.match(/>([^<]+)</i)
    const title = titleMatch ? titleMatch[1].trim() : null
    
    // Extraire le prix du titre (format: "1.771 €" ou "1.771€")
    const priceMatch = title ? title.match(/(\d+(?:\.\d+)?)\s*€/i) : null
    const price = priceMatch ? `${priceMatch[1]} €` : null
    
    // Extraire la taille du titre (format: "81,8 m²")
    const sizeMatch = title ? title.match(/(\d+(?:,\d+)?)\s*m²/i) : null
    const size = sizeMatch ? `${sizeMatch[1]} m²` : null
    
    // Extraire le nombre de pièces du titre (format: "3 Zimmer")
    const roomsMatch = title ? title.match(/(\d+)\s*Zimmer/i) : null
    const rooms = roomsMatch ? roomsMatch[1] : null
    
    // Déterminer le type depuis le titre
    let type = 'Apartment' // Par défaut
    if (title) {
      const titleLower = title.toLowerCase()
      if (titleLower.includes('studio')) {
        type = 'Studio'
      } else if (titleLower.includes('zimmer') && !titleLower.includes('wohnung')) {
        type = 'Room'
      } else if (titleLower.includes('haus') || titleLower.includes('house')) {
        type = 'House'
      }
    }
    
    // Détecter si meublé/non-meublé depuis le titre
    let furnished = false
    if (title) {
      const titleLower = title.toLowerCase()
      furnished = titleLower.includes('möbliert') || titleLower.includes('furnished') || titleLower.includes('eingerichtet')
    }
    
    // Extraire la description depuis le titre (enlever les infos techniques)
    let description = title
    if (title) {
      // Nettoyer le titre pour en faire une description
      description = title
        .replace(/\d+(?:\.\d+)?\s*€/g, '') // Enlever le prix
        .replace(/\d+(?:,\d+)?\s*m²/g, '') // Enlever la surface
        .replace(/\d+\s*Zimmer/g, '') // Enlever les pièces
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      if (description.length < 10) {
        description = title // Fallback si trop court
      }
    }
    
    if (title && price && linkUrl) {
      return {
        id: `immonet-${Date.now()}-${index}`,
        title,
        price,
        size,
        rooms,
        type,
        furnished,
        address: 'Berlin', // Par défaut Berlin
        image: 'N/A', // Pas d'image dans le lien
        link: linkUrl,
        description
      }
    }
    
    return null
  }
}
