/**
 * WG-Gesucht Scraper - Méthode simple et robuste
 */

import { BaseScraper } from '../core/base-scraper.js'

export class WGGesuchtScraper extends BaseScraper {
  constructor() {
    super('wg-gesucht')
    this.url = 'https://www.wg-gesucht.de/wohnungen-in-Berlin.8.0.1.0.html'
  }

  async scrape() {
    try {
      const html = await this.fetchPageWithBrowserless(this.url)
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
    
    // Diviser le HTML en sections par data-id
    const sections = html.split(/data-id="(\d+)"/)
    
    for (let i = 1; i < sections.length; i += 2) {
      const id = sections[i]
      const content = sections[i + 1]
      
      if (!id || !content) continue
      
      try {
        const listing = this.extractListingData(id, content)
        if (listing) {
          listings.push(listing)
        }
      } catch (error) {
        console.warn(`   - Error processing listing ${id}: ${error.message}`)
      }
    }
    
    return listings
  }

  extractListingData(id, content) {
    // Extraire le titre original
    const titleMatch = content.match(/title="[^"]*Anzeige ansehen: ([^"]+)"/)
    let title = titleMatch ? titleMatch[1].trim() : null
    
    // Extraire le prix
    const priceMatch = content.match(/<b>(\d+\s*€)<\/b>/)
    const price = priceMatch ? priceMatch[1].trim() : null
    
    // Extraire le lien
    const linkMatch = content.match(/href="([^"]+)"[^>]*title="[^"]*Anzeige ansehen/)
    const link = linkMatch ? `https://www.wg-gesucht.de${linkMatch[1]}` : null
    
    // Extraire l'image
    const imageMatch = content.match(/src="([^"]+)"[^>]*alt="[^"]*Anzeigenbild/)
    const image = imageMatch ? imageMatch[1] : null
    
    // Extraire l'adresse (nettoyer les retours à la ligne)
    const addressMatch = content.match(/<span>([^<]+)<\/span>/)
    let address = addressMatch ? addressMatch[1].trim() : null
    
    if (address) {
      // Nettoyer l'adresse des retours à la ligne et espaces multiples
      address = address.replace(/\s+/g, ' ').trim()
      
      // Extraire le quartier et la rue si possible
      const parts = address.split('|')
      if (parts.length >= 2) {
        const street = parts[parts.length - 1].trim()
        const district = parts[parts.length - 2].trim()
        address = `${street}, ${district}, Berlin, Germany`
      } else {
        address = `${address}, Berlin, Germany`
      }
    }
    
    // Extraire la surface en m²
    const sizeMatch = content.match(/(\d+)\s*m²/)
    const size = sizeMatch ? parseInt(sizeMatch[1]) : null
    
    // Extraire le nombre de pièces
    const roomsMatch = content.match(/(\d+)\s*Zimmer/)
    const rooms = roomsMatch ? parseInt(roomsMatch[1]) : 1
    
    // Déterminer le type de logement
    let type = 'Room' // Par défaut pour WG-Gesucht
    if (title) {
      const titleLower = title.toLowerCase()
      if (titleLower.includes('wohnung') || titleLower.includes('apartment')) {
        type = 'Apartment'
      } else if (titleLower.includes('haus') || titleLower.includes('house')) {
        type = 'House'
      } else if (titleLower.includes('studio')) {
        type = 'Studio'
      }
    }
    
    // Détecter si meublé/non-meublé depuis le titre
    let furnished = false
    if (title) {
      const titleLower = title.toLowerCase()
      furnished = titleLower.includes('möbliert') || titleLower.includes('furnished') || titleLower.includes('eingerichtet')
    }
    
    // Créer un titre plus attrayant si nécessaire
    if (!title || title.length < 10) {
      title = type === 'Room' ? 'Furnished Room' : `${type} for Rent`
    }
    
    // Extraire la description depuis le contenu HTML
    let description = title
    const descriptionMatch = content.match(/<p[^>]*class="[^"]*truncate[^"]*"[^>]*>([^<]+)<\/p>/i)
    if (descriptionMatch) {
      description = descriptionMatch[1].trim()
    } else {
      // Fallback: utiliser le titre comme description
      if (title && title.length > 50) {
        description = title.substring(0, 100) + '...'
      }
    }
    
    if (title && price) {
      return {
        id: `wg-${id}`,
        title,
        price,
        address,
        link,
        image,
        size,
        rooms,
        type,
        furnished,
        description,
        originalId: id
      }
    }
    
    return null
  }
}
