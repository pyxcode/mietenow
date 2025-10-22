/**
 * Immonet Scraper
 */

import { BaseScraper } from '../core/base-scraper.js'

export class ImmonetScraper extends BaseScraper {
  constructor() {
    super('immonet')
    this.url = 'https://www.immonet.de/classified-search?distributionTypes=Rent&estateTypes=Apartment&locations=AD08DE8634'
  }

  async scrape() {
    try {
      // Attendre plus longtemps pour le chargement du contenu
      const html = await this.fetchPage(this.url, 'body', 10000) // 10 secondes
      if (!html) return []

      // Attendre un peu plus pour le chargement dynamique
      await new Promise(resolve => setTimeout(resolve, 3000))

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
    
    // Chercher les boutons d'annonces Immonet avec data-testid="card-mfe-covering-link-testid"
    const buttonRegex = /<button[^>]*data-testid="card-mfe-covering-link-testid"[^>]*>/gi
    const buttons = html.match(buttonRegex)
    
    if (!buttons) {
      console.log('No Immonet buttons found')
      return listings
    }
    
    console.log(`Found ${buttons.length} Immonet buttons`)
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      
      try {
        const listing = this.extractListingFromButton(button, i)
        if (listing) {
          listings.push(listing)
        }
      } catch (error) {
        console.warn(`   - Error processing button ${i}: ${error.message}`)
      }
    }
    
    return listings
  }

  extractListingFromButton(button, index) {
    // Extraire data-base (URL de base)
    const dataBaseMatch = button.match(/data-base="([^"]+)"/i)
    const dataBase = dataBaseMatch ? decodeURIComponent(dataBaseMatch[1]) : null
    
    // Extraire data-plus (paramètres supplémentaires)
    const dataPlusMatch = button.match(/data-plus="([^"]+)"/i)
    const dataPlus = dataPlusMatch ? decodeURIComponent(dataPlusMatch[1]) : ''
    
    // Extraire le titre depuis l'attribut title
    const titleMatch = button.match(/title="([^"]+)"/i)
    const title = titleMatch ? titleMatch[1].trim() : null
    
    // Construire l'URL complète
    const link = dataBase ? `${dataBase}${dataPlus}` : null
    
    // Extraire le prix du titre (format: "1.771&nbsp;€" ou "1.771 €")
    const priceMatch = title ? title.match(/(\d+(?:\.\d+)?)(?:&nbsp;|\s)*€/i) : null
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
    
    if (title && price && link) {
      return {
        id: `immonet-${Date.now()}-${index}`,
        title,
        price,
        size,
        rooms,
        type,
        furnished,
        address: 'Berlin', // Par défaut Berlin
        image: 'N/A', // Pas d'image dans le bouton
        link,
        description
      }
    }
    
    return null
  }
}
