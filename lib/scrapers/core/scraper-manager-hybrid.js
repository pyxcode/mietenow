/**
 * Scraper Manager Hybride - Utilise Browserless pour les sites qui nécessitent Chrome
 */

import { WGGesuchtScraper } from '../providers/wg-gesucht-scraper.js'
import { KleinanzeigenScraper } from '../providers/kleinanzeigen-scraper.js'
import { ImmobilienScout24Scraper } from '../providers/immobilienScout24-scraper.js'
import { ImmoweltScraper } from '../providers/immowelt-scraper.js'
import { ImmonetScraper } from '../providers/immonet-scraper.js'
import { DetailedScraper } from '../providers/detailed-scraper.js'
import { CloudinaryService } from '../services/cloudinary-service.js'
import { MongoService } from '../services/mongo-service.js'

// Import des scrapers avec Browserless pour les sites qui nécessitent Chrome
import { WGGesuchtScraperBrowserless } from '../providers/wg-gesucht-scraper-browserless.js'
import { KleinanzeigenScraperBrowserless } from '../providers/kleinanzeigen-scraper-browserless.js'
import { ImmoweltScraperBrowserless } from '../providers/immowelt-scraper-browserless.js'
import { ImmonetScraperBrowserless } from '../providers/immonet-scraper-browserless.js'

export class ScraperManagerHybrid {
  constructor() {
    // Sites qui peuvent utiliser l'API ou HTTP simple (pas de Chrome nécessaire)
    this.apiScrapers = {
      'immobilienScout24': new ImmobilienScout24Scraper() // Utilise l'API mobile
    }
    
    // Sites qui nécessitent Chrome (utilisent Browserless)
    this.browserlessScrapers = {
      'wg-gesucht': new WGGesuchtScraperBrowserless(),
      'kleinanzeigen': new KleinanzeigenScraperBrowserless(),
      'immowelt': new ImmoweltScraperBrowserless(),
      'immonet': new ImmonetScraperBrowserless()
    }
    
    this.cloudinary = new CloudinaryService()
    this.mongo = new MongoService()
    this.detailedScraper = new DetailedScraper('detailed')
  }

  async scrapeAll() {
    console.log('🚀 Starting hybrid scraping for all platforms...')
    console.log('📊 API/HTTP scrapers:', Object.keys(this.apiScrapers).join(', '))
    console.log('🌐 Browserless scrapers:', Object.keys(this.browserlessScrapers).join(', '))
    console.log('=' .repeat(60))
    
    // Connecter à MongoDB
    await this.mongo.connect()
    
    const results = {
      total: 0,
      platforms: {},
      timestamp: new Date().toISOString()
    }
    
    // Scraper les sites API/HTTP d'abord (plus rapides)
    for (const [platformName, scraper] of Object.entries(this.apiScrapers)) {
      console.log(`\n📊 Scraping ${platformName} (API/HTTP)...`)
      
      try {
        const listings = await scraper.scrape()
        results.platforms[platformName] = {
          found: listings.length,
          listings: listings
        }
        results.total += listings.length
        
        console.log(`✅ ${platformName}: ${listings.length} listings found`)
      } catch (error) {
        console.error(`❌ ${platformName}: Scraping failed:`, error.message)
        results.platforms[platformName] = {
          found: 0,
          listings: [],
          error: error.message
        }
      }
    }
    
    // Scraper les sites Browserless ensuite
    for (const [platformName, scraper] of Object.entries(this.browserlessScrapers)) {
      console.log(`\n📊 Scraping ${platformName} (Browserless)...`)
      
      try {
        const listings = await scraper.scrape()
        results.platforms[platformName] = {
          found: listings.length,
          listings: listings
        }
        results.total += listings.length
        
        console.log(`✅ ${platformName}: ${listings.length} listings found`)
      } catch (error) {
        console.error(`❌ ${platformName}: Scraping failed:`, error.message)
        results.platforms[platformName] = {
          found: 0,
          listings: [],
          error: error.message
        }
      }
    }
    
    console.log(`\n🎉 Scraping completed! Total: ${results.total} listings`)
    
    // Sauvegarder toutes les annonces
    await this.saveAllListings(results.platforms)
    
    // Déconnecter de MongoDB
    await this.mongo.disconnect()
    
    return results
  }

  async saveAllListings(platforms) {
    console.log('\n💾 Saving all listings to MongoDB...')
    
    let totalSaved = 0
    
    for (const [platformName, platformData] of Object.entries(platforms)) {
      if (platformData.error) {
        console.log(`⚠️ ${platformName}: Skipping save due to error`)
        continue
      }
      
      const saved = await this.savePlatformListings(platformName, platformData.listings)
      totalSaved += saved
      console.log(`✅ ${platformName}: ${saved} listings saved`)
    }
    
    console.log(`🎉 Total saved: ${totalSaved} listings`)
  }

  async savePlatformListings(platformName, listings) {
    if (!listings || listings.length === 0) return 0
    
    let savedCount = 0
    
    for (const listing of listings) {
      try {
        const saved = await this.mongo.saveListing(listing)
        if (saved) savedCount++
      } catch (error) {
        console.error(`❌ Error saving ${platformName} listing:`, error.message)
      }
    }
    
    return savedCount
  }
}
