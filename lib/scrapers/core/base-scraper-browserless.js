/**
 * Base Scraper avec Browserless - Utilise Browserless.io au lieu de Puppeteer local
 */

import fs from 'fs'
import os from 'os'
import path from 'path'
import { GeocodingService } from '../services/geocoding-service.js'

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
    this.browserlessUrl = 'https://production-sfo.browserless.io'
    this.browserlessToken = process.env.BROWSERLESS_TOKEN
    this.geocodingService = new GeocodingService()
  }

  async buildHash(...inputs) {
    if (!inputs || inputs.length === 0) return null
    const cleaned = inputs.filter(i => i != null && i.length > 0)
    if (cleaned.length === 0) return null
    
    const crypto = await import('crypto')
    return crypto.createHash('sha256').update(cleaned.join(',')).digest('hex')
  }

  async fetchPage(url, selector = null) {
    try {
      console.log(`🔍 ${this.platformName}: Fetching ${url}`)
      
      if (!this.browserlessToken) {
        throw new Error('BROWSERLESS_TOKEN environment variable is not set')
      }

      const response = await fetch(`${this.browserlessUrl}/content?token=${this.browserlessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          viewport: {
            width: 1920,
            height: 1080
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Browserless error: ${response.status} ${response.statusText}`)
      }

      const html = await response.text()
      console.log(`✅ ${this.platformName}: Page loaded (${html.length} chars)`)
      
      return html
    } catch (error) {
      console.error(`❌ ${this.platformName}: Error fetching page:`, error.message)
      return null
    }
  }

  async fetchFromAPI(url, headers = {}) {
    try {
      console.log(`🔍 ${this.platformName}: Fetching API ${url}`)
      
      const response = await fetch(url, {
        headers: {
          ...DEFAULT_HEADER,
          ...headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ ${this.platformName}: API data received`)
      
      return data
    } catch (error) {
      console.error(`❌ ${this.platformName}: Error fetching API:`, error.message)
      return null
    }
  }

  async enrichListingsWithCoordinates(listings) {
    console.log(`🌍 ${this.platformName}: Enriching ${listings.length} listings with coordinates...`)
    
    const enrichedListings = []
    
    for (const listing of listings) {
      try {
        if (listing.address && listing.address !== 'N/A') {
          const coords = await this.geocodingService.getCoordinates(listing.address)
          if (coords) {
            listing.lat = coords.lat
            listing.lng = coords.lng
            listing.formatted_address = coords.formatted_address
          }
        }
        
        enrichedListings.push(listing)
      } catch (error) {
        console.error(`❌ ${this.platformName}: Error enriching listing:`, error.message)
        enrichedListings.push(listing)
      }
    }
    
    return enrichedListings
  }

  normalizeListing(listing) {
    return {
      title: listing.title || 'N/A',
      price: listing.price || 'N/A',
      size: listing.size || 'N/A',
      rooms: listing.rooms || 'N/A',
      type: listing.type || 'Apartment',
      furnished: listing.furnished || false,
      address: listing.address || 'N/A',
      link: listing.link || 'N/A',
      image: listing.image || 'N/A',
      description: listing.description || 'N/A',
      lat: listing.lat || null,
      lng: listing.lng || null,
      formatted_address: listing.formatted_address || 'N/A',
      platform: this.platformName,
      scrapedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      imageSource: 'original'
    }
  }

  extractListings(html) {
    // Cette méthode doit être implémentée par chaque scraper spécifique
    throw new Error('extractListings method must be implemented by subclass')
  }
}
