/**
 * ImmobilienScout24 Scraper - API Mobile Method
 */

import { BaseScraper } from '../core/base-scraper.js'

export class ImmobilienScout24Scraper extends BaseScraper {
  constructor() {
    super('immobilienScout24')
    this.apiUrl = 'https://api.mobile.immobilienscout24.de/search/list?pricetype=calculatedtotalrent&realestatetype=apartmentrent&searchType=region&geocodes=%2Fde%2Fberlin%2Fberlin&pagenumber=1'
  }

  async scrape() {
    try {
      const listings = await this.fetchFromAPI()
      console.log(`✅ ${this.platformName}: ${listings.length} listings found`)
      
      // Enrichir avec les coordonnées géographiques
      const enrichedListings = await this.enrichListingsWithCoordinates(listings)
      
      return enrichedListings.map(listing => this.normalizeListing(listing))
    } catch (error) {
      console.error(`❌ ${this.platformName}: Scraping failed:`, error.message)
      return []
    }
  }

  async fetchFromAPI() {
    const listings = []
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'User-Agent': 'ImmoScout_27.3_26.0_._',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          supportedResultListTypes: [],
          userData: {}
        })
      })
      
      if (!response.ok) {
        console.log(`❌ ${this.platformName}: API failed with status ${response.status}`)
        return listings
      }
      
      const data = await response.json()
      
      if (data.resultListItems) {
        const items = data.resultListItems.filter(item => item.type === 'EXPOSE_RESULT')
        
        for (const item of items) {
          try {
            const listing = this.extractListingData(item)
            if (listing) {
              listings.push(listing)
            }
          } catch (error) {
            console.warn(`   - Error processing listing: ${error.message}`)
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ ${this.platformName}: API error:`, error.message)
    }
    
    return listings
  }

  extractListingData(item) {
    const expose = item.item
    const [price, size] = expose.attributes || []
    const image = expose?.titlePicture?.preview ?? null
    
    const id = this.buildHash(
      expose.title || 'unknown',
      price?.value || '0',
      expose.id || 'unknown'
    )
    
    // Extraire le nombre de pièces depuis les attributs
    let rooms = null
    if (expose.attributes) {
      const roomsAttr = expose.attributes.find(attr => 
        attr.name && attr.name.toLowerCase().includes('zimmer')
      )
      rooms = roomsAttr ? roomsAttr.value : null
    }
    
    // Déterminer le type depuis le titre
    let type = 'Apartment' // Par défaut
    if (expose.title) {
      const titleLower = expose.title.toLowerCase()
      if (titleLower.includes('studio')) {
        type = 'Studio'
      } else if (titleLower.includes('zimmer') && !titleLower.includes('wohnung')) {
        type = 'Room'
      } else if (titleLower.includes('haus') || titleLower.includes('house')) {
        type = 'House'
      }
    }
    
    // Détecter si meublé/non-meublé depuis le titre ou la description
    let furnished = false
    if (expose.title || expose.description) {
      const text = `${expose.title || ''} ${expose.description || ''}`.toLowerCase()
      furnished = text.includes('möbliert') || text.includes('furnished') || text.includes('eingerichtet')
    }
    
    return {
      id,
      title: expose.title || 'No title available',
      price: price ? `${price.value} €` : 'N/A',
      size: size ? `${size.value} m²` : 'N/A',
      rooms,
      type,
      furnished,
      address: expose.address?.line || 'N/A',
      link: expose.id ? `https://www.immobilienscout24.de/expose/${expose.id}` : 'N/A',
      image: image,
      description: expose.description || 'N/A'
    }
  }
}
