/**
 * Base Scraper - Classe de base pour tous les scrapers
 */

import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { GeocodingService } from '../services/geocoding-service.js'

// Configuration des plugins anti-détection
puppeteer.use(StealthPlugin())

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
    this.browser = null
    this.page = null
    this.geocodingService = new GeocodingService()
  }

  async buildHash(...inputs) {
    if (!inputs || inputs.length === 0) return null
    const cleaned = inputs.filter(i => i != null && i.length > 0)
    if (cleaned.length === 0) return null
    
    const crypto = await import('crypto')
    return crypto.createHash('sha256').update(cleaned.join(',')).digest('hex')
  }

  async launchBrowser() {
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'puppeteer-'))
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-crash-reporter',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings',
        '--disable-logging',
        '--disable-permissions-api',
        '--disable-presentation-api',
        '--disable-remote-fonts',
        '--disable-speech-api',
        '--disable-file-system',
        '--disable-notifications',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      timeout: 60000,
      userDataDir,
    })
    
    this.page = await this.browser.newPage()
    
    // Configuration anti-détection
    await this.page.setExtraHTTPHeaders(DEFAULT_HEADER)
    
    // Masquer les propriétés webdriver
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      })
      
      window.chrome = {
        runtime: {},
      }
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      })
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['de-DE', 'de', 'en'],
      })
    })
  }

  async closeBrowser() {
    try {
      if (this.page) await this.page.close()
      if (this.browser) await this.browser.close()
    } catch (error) {
      console.warn(`Error closing browser for ${this.platformName}:`, error.message)
    }
  }

  async fetchPage(url, waitForSelector = null, timeout = 30000) {
    try {
      console.log(`🔍 ${this.platformName}: Fetching ${url}`)
      
      if (!this.browser) {
        await this.launchBrowser()
      }

      const response = await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: timeout
      })

      let pageSource
      if (waitForSelector) {
        await this.page.waitForSelector(waitForSelector, { timeout: timeout })
        pageSource = await this.page.evaluate((selector) => {
          const el = document.querySelector(selector)
          return el ? el.innerHTML : ''
        }, waitForSelector)
      } else {
        pageSource = await this.page.content()
      }

      const statusCode = response.status()

      if (statusCode === 403 || statusCode === 429) {
        console.warn(`❌ ${this.platformName}: Bot detected`)
        return null
      } else {
        console.log(`✅ ${this.platformName}: Page loaded successfully`)
        return pageSource
      }
    } catch (error) {
      console.error(`❌ ${this.platformName}: Error fetching page:`, error.message)
      return null
    }
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
