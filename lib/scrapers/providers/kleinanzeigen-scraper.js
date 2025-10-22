/**
 * Kleinanzeigen Scraper
 */

import { BaseScraper } from '../core/base-scraper.js'

export class KleinanzeigenScraper extends BaseScraper {
  constructor() {
    super('kleinanzeigen')
    this.url = 'https://www.kleinanzeigen.de/s-wohnung-mieten/berlin/c203l3331'
  }

  async scrape() {
    try {
      const html = await this.fetchPage(this.url, 'body')
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
    
    // Chercher les annonces Kleinanzeigen
    const sections = html.split(/<article[^>]*class="[^"]*aditem[^"]*"[^>]*>/g)
    
    for (let i = 1; i < sections.length; i++) {
      const content = sections[i]
      
      try {
        const listing = this.extractListingData(content, i)
        if (listing) {
          listings.push(listing)
        }
      } catch (error) {
        console.warn(`   - Error processing listing: ${error.message}`)
      }
    }
    
    return listings
  }

  extractListingData(content, index) {
    // Extraire le titre
    const titleMatch = content.match(/<h2[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/)
    const title = titleMatch ? titleMatch[1].trim() : null
    
    // Extraire le prix
    const priceMatch = content.match(/<p[^>]*class="[^"]*aditem-main--middle--price[^"]*"[^>]*>([^<]+)<\/p>/)
    const price = priceMatch ? priceMatch[1].trim() : null
    
    // Extraire le lien
    const linkMatch = content.match(/<a[^>]*href="([^"]+)"[^>]*>/)
    const link = linkMatch ? 
      (linkMatch[1].startsWith('http') ? linkMatch[1] : `https://www.kleinanzeigen.de${linkMatch[1]}`) : 
      null
    
    // Extraire l'image
    const imageMatch = content.match(/<img[^>]*src="([^"]+)"[^>]*>/)
    const image = imageMatch ? imageMatch[1] : null
    
    // Extraire la surface depuis le titre (format: "2-Zimmer-Wohnung 65 m²")
    const sizeMatch = title ? title.match(/(\d+[.,]?\d*)\s*m²/) : null
    const size = sizeMatch ? `${sizeMatch[1].replace(',', '.')} m²` : null
    
    // Extraire le nombre de pièces depuis le titre (format: "2-Zimmer-Wohnung")
    const roomsMatch = title ? title.match(/(\d+)-Zimmer/) : null
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
    
    // Extraire la description depuis le titre
    let description = title
    if (title) {
      // Nettoyer le titre pour en faire une description
      description = title
        .replace(/\d+\s*€/g, '') // Enlever le prix
        .replace(/\d+\s*m²/g, '') // Enlever la surface
        .replace(/\d+\s*Zimmer/g, '') // Enlever les pièces
        .replace(/\d+-Zimmer/g, '') // Enlever "2-Zimmer"
        .replace(/\s+/g, ' ')
        .trim()
      
      if (description.length < 10) {
        description = title // Fallback si trop court
      }
    }
    
    if (title && price) {
      return {
        id: `kleinanzeigen-${Date.now()}-${index}`,
        title,
        price,
        link,
        image,
        size,
        rooms,
        type,
        furnished,
        description
      }
    }
    
    return null
  }
}
