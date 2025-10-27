/**
 * Immowelt Scraper
 */

import { BaseScraper } from '../core/base-scraper.js'

export class ImmoweltScraper extends BaseScraper {
  constructor() {
    super('immowelt')
    this.url = 'https://www.immowelt.de/liste/berlin/wohnungen/mieten'
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
    
    // Immowelt utilise des liens avec data-testid="card-mfe-covering-link-testid"
    const linkMatches = html.match(/<a[^>]*data-testid="card-mfe-covering-link-testid"[^>]*>/g)
    
    if (linkMatches) {
      console.log(`   📊 Found ${linkMatches.length} Immowelt links`)
      
      // Extraire toutes les images d'annonces
      const imageMatches = html.match(/<img[^>]*src="https:\/\/mms\.immowelt\.de\/[^"]*"[^>]*>/gi)
      const images = imageMatches ? imageMatches.map(img => {
        const srcMatch = img.match(/src="([^"]+)"/i)
        return srcMatch ? srcMatch[1] : null
      }).filter(Boolean) : []
      
      console.log(`   📊 Found ${images.length} Immowelt images`)
      
      for (let i = 0; i < linkMatches.length; i++) {
        const linkHtml = linkMatches[i]
        
        try {
          const listing = this.extractListingData(linkHtml, i, images[i] || null)
          if (listing) {
            listings.push(listing)
          }
        } catch (error) {
          console.warn(`   - Error processing listing: ${error.message}`)
        }
      }
    }
    
    return listings
  }

  extractListingData(content, index, image = null) {
    // Extraire le titre depuis l'attribut title
    const titleMatch = content.match(/title="([^"]+)"/)
    const title = titleMatch ? titleMatch[1].trim() : null
    
    // Extraire le prix depuis le titre (format: "Studio zur Miete - Berlin - 1.025&nbsp;€")
    const priceMatch = title ? title.match(/(\d+[.,]\d+)(?:&nbsp;|\s)*€/) : null
    const price = priceMatch ? `${priceMatch[1].replace(',', '.')} €` : null
    
    // Extraire le lien
    const linkMatch = content.match(/href="([^"]+)"/)
    const link = linkMatch ? 
      (linkMatch[1].startsWith('http') ? linkMatch[1] : `https://www.immowelt.de${linkMatch[1]}`) : 
      null
    
    // Extraire la surface depuis le titre (format: "Studio zur Miete - Berlin - 1.025 € - 1 Zimmer, 36,7 m²")
    const sizeMatch = title ? title.match(/(\d+[.,]\d+)\s*m²/) : null
    const size = sizeMatch ? `${sizeMatch[1].replace(',', '.')} m²` : null
    
    // Extraire le nombre de pièces depuis le titre (format: "1 Zimmer, 36,7 m²")
    const roomsMatch = title ? title.match(/(\d+)\s*Zimmer/) : null
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
        .replace(/\d+[.,]\d+\s*€/g, '') // Enlever le prix
        .replace(/-\s*Berlin\s*-/g, '') // Enlever "Berlin"
        .replace(/\d+\s*Zimmer/g, '') // Enlever les pièces
        .replace(/\d+[.,]\d+\s*m²/g, '') // Enlever la surface
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      if (description.length < 10) {
        description = title // Fallback si trop court
      }
    }
    
    if (title && price) {
      return {
        id: `immowelt-${Date.now()}-${index}`,
        title,
        price,
        link,
        image: image || 'N/A',
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
