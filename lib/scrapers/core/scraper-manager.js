/**
 * Scraper Manager - Wrapper central pour tous les scrapers
 */

import { WGGesuchtScraper } from '../providers/wg-gesucht-scraper.js'
import { KleinanzeigenScraper } from '../providers/kleinanzeigen-scraper.js'
import { ImmobilienScout24Scraper } from '../providers/immobilienScout24-scraper.js'
import { ImmoweltScraper } from '../providers/immowelt-scraper.js'
import { ImmonetScraper } from '../providers/immonet-scraper.js'
import { DetailedScraper } from '../providers/detailed-scraper.js'
import { CloudinaryService } from '../services/cloudinary-service.js'
import { MongoService } from '../services/mongo-service.js'

export class ScraperManager {
  constructor() {
    this.scrapers = {
      'wg-gesucht': new WGGesuchtScraper(),
      'kleinanzeigen': new KleinanzeigenScraper(),
      'immobilienScout24': new ImmobilienScout24Scraper(),
      'immowelt': new ImmoweltScraper(),
      'immonet': new ImmonetScraper()
    }
    
    this.cloudinary = new CloudinaryService()
    this.mongo = new MongoService()
    this.detailedScraper = new DetailedScraper('detailed')
  }

  async scrapeAll() {
    console.log('🚀 Starting scraping for all platforms...')
    console.log('=' .repeat(60))
    
    // Connecter à MongoDB
    await this.mongo.connect()
    
    const results = {
      total: 0,
      platforms: {},
      timestamp: new Date().toISOString()
    }
    
    for (const [platformName, scraper] of Object.entries(this.scrapers)) {
      console.log(`\n📊 Scraping ${platformName}...`)
      
      try {
        const listings = await scraper.scrape()
        results.platforms[platformName] = {
          found: listings.length,
          listings: listings
        }
        results.total += listings.length
        
        // Récupérer les descriptions détaillées (optionnel, pour les 5 premières annonces)
        if (listings.length > 0) {
          console.log(`   📝 Fetching detailed descriptions for first 5 listings...`)
          const sampleListings = listings.slice(0, 5)
          const detailedListings = await this.detailedScraper.scrapeDetailedListings(sampleListings)
          
          // Remplacer les listings de base par les versions détaillées
          listings.splice(0, 5, ...detailedListings)
        }
        
        // Traiter les images avec Cloudinary
        if (listings.length > 0) {
          await this.processImages(listings, platformName)
        }
        
        // Sauvegarder dans MongoDB
        if (listings.length > 0) {
          const savedCount = await this.mongo.saveListings(listings, platformName)
          results.platforms[platformName].saved = savedCount
        }
        
        // Attendre entre les plateformes
        await this.delay(2000)
        
      } catch (error) {
        console.error(`❌ ${platformName} failed:`, error.message)
        results.platforms[platformName] = {
          found: 0,
          saved: 0,
          error: error.message
        }
      } finally {
        await scraper.closeBrowser()
        await this.detailedScraper.closeBrowser()
      }
    }
    
    // Déconnecter de MongoDB
    await this.mongo.disconnect()
    
    console.log(`\n🎉 Scraping completed!`)
    console.log(`📊 Total listings found: ${results.total}`)
    
    Object.entries(results.platforms).forEach(([platform, result]) => {
      console.log(`   - ${platform}: ${result.found} found, ${result.saved || 0} saved`)
    })
    
    return results
  }

  async scrapePlatform(platformName) {
    const scraper = this.scrapers[platformName]
    if (!scraper) {
      throw new Error(`Unknown platform: ${platformName}`)
    }
    
    console.log(`🚀 Starting scraping for ${platformName}...`)
    
    try {
      const listings = await scraper.scrape()
      
      if (listings.length > 0) {
        // Récupérer les descriptions détaillées pour les 5 premières annonces
        console.log(`   📝 Fetching detailed descriptions for first 5 listings...`)
        
        // Utiliser le browser du scraper principal
        this.detailedScraper.setBrowser(scraper.browser, scraper.page)
        
        const sampleListings = listings.slice(0, 5)
        const detailedListings = await this.detailedScraper.scrapeDetailedListings(sampleListings)
        
        // Remplacer les listings de base par les versions détaillées
        listings.splice(0, 5, ...detailedListings)
        
        await this.processImages(listings, platformName)
        const savedCount = await this.mongo.saveListings(listings, platformName)
        
        console.log(`✅ ${platformName}: ${listings.length} found, ${savedCount} saved`)
        return { found: listings.length, saved: savedCount, listings }
      }
      
      return { found: 0, saved: 0, listings: [] }
      
    } catch (error) {
      console.error(`❌ ${platformName} failed:`, error.message)
      return { found: 0, saved: 0, error: error.message }
    } finally {
      await scraper.closeBrowser()
      // Ne pas fermer le browser du detailed scraper car il utilise celui du scraper principal
    }
  }

  async searchAll(criteria) {
    console.log('🔍 Starting search with criteria:', criteria)
    
    // Connecter à MongoDB
    await this.mongo.connect()
    
    try {
      // Construire le filtre MongoDB
      const filter = this.buildMongoFilter(criteria)
      
      // Récupérer les annonces depuis MongoDB
      const listings = await this.mongo.getListings(filter, 100)
      
      console.log(`📊 Found ${listings.length} listings matching criteria`)
      
      return {
        listings,
        totalFound: listings.length,
        errors: []
      }
      
    } catch (error) {
      console.error('❌ Search failed:', error.message)
      return {
        listings: [],
        totalFound: 0,
        errors: [error.message]
      }
    } finally {
      await this.mongo.disconnect()
    }
  }

  buildMongoFilter(criteria) {
    const filter = {}
    
    // Filtre par ville
    if (criteria.city) {
      filter.city = criteria.city
    }
    
    // Filtre par prix
    if (criteria.minPrice || criteria.maxPrice) {
      filter.price = {}
      if (criteria.minPrice) {
        filter.price.$gte = criteria.minPrice
      }
      if (criteria.maxPrice) {
        filter.price.$lte = criteria.maxPrice
      }
    }
    
    // Filtre par nombre de pièces
    if (criteria.minRooms || criteria.maxRooms) {
      filter.rooms = {}
      if (criteria.minRooms) {
        filter.rooms.$gte = criteria.minRooms
      }
      if (criteria.maxRooms) {
        filter.rooms.$lte = criteria.maxRooms
      }
    }
    
    // Filtre par taille
    if (criteria.minSize || criteria.maxSize) {
      filter.size = {}
      if (criteria.minSize) {
        filter.size.$gte = criteria.minSize
      }
      if (criteria.maxSize) {
        filter.size.$lte = criteria.maxSize
      }
    }
    
    // Filtre par quartiers
    if (criteria.districts && criteria.districts.length > 0) {
      filter.district = { $in: criteria.districts }
    }
    
    // Filtre par fonctionnalités
    if (criteria.features && criteria.features.length > 0) {
      filter.features = { $in: criteria.features }
    }
    
    return filter
  }

  getScrapersStatus() {
    return Object.keys(this.scrapers).map(platform => ({
      platform,
      status: 'active'
    }))
  }

  async processImages(listings, platformName) {
    console.log(`   🖼️ Processing images for ${platformName}...`)
    
    for (const listing of listings) {
      if (listing.image && listing.image !== 'N/A') {
        try {
          // Vérifier si l'image est accessible
          const isAccessible = await this.checkImageAccessibility(listing.image)
          
          if (!isAccessible) {
            console.log(`   ⚠️ Image not accessible: ${listing.image}`)
            // Uploader vers Cloudinary
            const cloudinaryUrl = await this.cloudinary.uploadImage(listing.image, listing.id)
            if (cloudinaryUrl) {
              listing.image = cloudinaryUrl
              listing.imageSource = 'cloudinary'
            } else {
              listing.image = null
              listing.imageSource = 'failed'
            }
          } else {
            listing.imageSource = 'original'
          }
        } catch (error) {
          console.warn(`   ⚠️ Error processing image: ${error.message}`)
          listing.image = null
          listing.imageSource = 'error'
        }
      } else {
        listing.image = null
        listing.imageSource = 'none'
      }
    }
  }

  async checkImageAccessibility(imageUrl) {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getAvailablePlatforms() {
    return Object.keys(this.scrapers)
  }

  getScraper(platformName) {
    return this.scrapers[platformName]
  }
}
