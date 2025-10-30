/**
 * Base Scraper - Classe de base pour tous les scrapers
 */

import { GeocodingService } from '../services/geocoding-service.js'
import fetch from 'node-fetch'

const DEFAULT_HEADER = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

export class BaseScraper {
  constructor(platformName) {
    this.platformName = platformName
    this.geocodingService = new GeocodingService()
    this.browserlessUrl = 'https://production-sfo.browserless.io'
    this.browserlessToken = process.env.BROWSERLESS_TOKEN
  }

  async buildHash(...inputs) {
    if (!inputs || inputs.length === 0) return null
    const cleaned = inputs.filter(i => i != null && i.length > 0)
    if (cleaned.length === 0) return null
    
    const crypto = await import('crypto')
    return crypto.createHash('sha256').update(cleaned.join(',')).digest('hex')
  }

  async fetchPageWithBrowserless(url, customHeaders = null) {
    try {
      console.log(`🔍 ${this.platformName}: Fetching ${url} with Browserless`)
      
      if (!this.browserlessToken) {
        throw new Error('BROWSERLESS_TOKEN environment variable is not set')
      }

      const headers = customHeaders || DEFAULT_HEADER
      const userAgent = headers['User-Agent'] || DEFAULT_HEADER['User-Agent']

      const response = await fetch(`${this.browserlessUrl}/content?token=${this.browserlessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          viewport: {
            width: 1920,
            height: 1080
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Browserless error: ${response.status} - ${errorText}`)
      }

      const html = await response.text()
      console.log(`✅ ${this.platformName}: Page loaded (${html.length} chars)`)
      
      return html
    } catch (error) {
      console.error(`❌ ${this.platformName}: Error fetching page with Browserless:`, error.message)
      return null
    }
  }

  async fetchPage(url, waitForSelector = null, timeout = 30000) {
    // Utiliser Browserless au lieu de Puppeteer
    return await this.fetchPageWithBrowserless(url)
  }

  async closeBrowser() {
    // Plus besoin de fermer le navigateur avec Browserless
    return Promise.resolve()
  }

  // Méthode à implémenter par chaque scraper
  async scrape() {
    throw new Error('scrape() method must be implemented by subclass')
  }

  // Méthode utilitaire pour normaliser les données
  normalizeListing(listing) {
    return {
      ...listing,
      platform: this.platformName,
      scrapedAt: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // Méthode pour enrichir les listings avec les coordonnées géographiques
  async enrichListingsWithCoordinates(listings) {
    console.log(`   🌍 Geocoding ${listings.length} addresses...`)
    
    const enrichedListings = []
    
    for (const listing of listings) {
      try {
        // Nettoyer l'adresse
        let cleanAddress = listing.address || 'Berlin, Germany'
        
        // Si l'adresse est générique, essayer d'extraire du titre
        if (cleanAddress === 'Berlin' || cleanAddress === 'Berlin, Germany') {
          cleanAddress = this.geocodingService.extractAddressFromTitle(listing.title)
        }
        
        // Nettoyer l'adresse
        cleanAddress = this.geocodingService.cleanAddress(cleanAddress)
        
        // Géocoder l'adresse
        const coordinates = await this.geocodingService.geocodeAddress(cleanAddress)
        
        // Enrichir le listing
        const enrichedListing = {
          ...listing,
          address: cleanAddress,
          lat: coordinates.lat,
          lng: coordinates.lng,
          formatted_address: coordinates.formatted_address
        }
        
        enrichedListings.push(enrichedListing)
        
      } catch (error) {
        console.warn(`   - Geocoding failed for listing: ${error.message}`)
        // Ajouter le listing sans coordonnées (avec fallback Berlin)
        enrichedListings.push({
          ...listing,
          address: listing.address || 'Berlin, Germany',
          lat: 52.5208,
          lng: 13.4095,
          formatted_address: 'Berlin, Germany'
        })
      }
    }
    
    console.log(`   ✅ Geocoding completed for ${enrichedListings.length} listings`)
    return enrichedListings
  }
}
