#!/usr/bin/env node

/**
 * Main Scraping & Alert Script
 * 
 * Features:
 * - HTTP-only scraping with OpenAI filtering
 * - Rate limiting to avoid being blocked
 * - Real-time alert sending for NEW listings only
 * - Optimized for Render deployment
 * 
 * Usage: node scripts/scrape-and-alert.js
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient } from 'mongodb'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { sendEmail } from '../lib/sendgrid-esm.js'

// Import crawler and sites
import { TOP_10_SITES } from './multi-site-crawler.js'
let HttpOnlyCrawler
async function initCrawler() {
  if (!HttpOnlyCrawler) {
    const module = await import('./http-only-crawler.js')
    HttpOnlyCrawler = module.default || module.HttpOnlyCrawler
  }
  return HttpOnlyCrawler
}

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2
const DB_NAME = 'mietenow-prod'
const COLLECTION_NAME = 'listings'
const ALERTS_COLLECTION = 'alerts'
const USERS_COLLECTION = 'users'
const STATS_FILE = 'logs/scraping-stats.json'

// Rate limiting configuration
const RATE_LIMITS = {
  requestsPerMinute: 30,  // Max 30 requests per minute per website
  delayBetweenRequests: 2000,  // 2 seconds between requests
  maxConcurrentSites: 2  // Max 2 websites scraped simultaneously
}

// Global stats tracking
let globalStats = {
  lastRun: null,
  totalScraped: 0,
  totalNew: 0,
  totalAlertsSent: 0,
  websiteStats: {},
  errors: [],
  rateLimitHits: 0
}

// Load existing stats
function loadStats() {
  if (existsSync(STATS_FILE)) {
    try {
      globalStats = { ...globalStats, ...JSON.parse(readFileSync(STATS_FILE, 'utf8')) }
    } catch (error) {
      console.log('⚠️ Could not load existing stats, starting fresh')
    }
  }
}

// Save stats
function saveStats() {
  try {
    writeFileSync(STATS_FILE, JSON.stringify(globalStats, null, 2))
  } catch (error) {
    console.error('❌ Failed to save stats:', error.message)
  }
}

// Rate limiting helper
class RateLimiter {
  constructor(requestsPerMinute, delayBetweenRequests) {
    this.requestsPerMinute = requestsPerMinute
    this.delayBetweenRequests = delayBetweenRequests
    this.requests = []
    this.lastRequest = 0
  }
  
  async waitIfNeeded() {
    const now = Date.now()
    
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => now - time < 60000)
    
    // Check if we've hit the rate limit
    if (this.requests.length >= this.requestsPerMinute) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = 60000 - (now - oldestRequest) + 1000 // Add 1 second buffer
      console.log(`⏳ Rate limit reached, waiting ${Math.round(waitTime / 1000)}s...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      globalStats.rateLimitHits++
    }
    
    // Ensure minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequest
    if (timeSinceLastRequest < this.delayBetweenRequests) {
      const waitTime = this.delayBetweenRequests - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    // Record this request
    this.requests.push(Date.now())
    this.lastRequest = Date.now()
  }
}

// Create rate limiters for each website
const rateLimiters = {}
TOP_10_SITES.forEach(site => {
  rateLimiters[site.provider] = new RateLimiter(
    RATE_LIMITS.requestsPerMinute,
    RATE_LIMITS.delayBetweenRequests
  )
})

// Scrape a single website with rate limiting
async function scrapeWebsite(site) {
  try {
    console.log(`\n🔍 Scraping: ${site.name}`)
    
    // Apply rate limiting
    await rateLimiters[site.provider].waitIfNeeded()
    
    const CrawlerClass = await initCrawler()
    if (!CrawlerClass) {
      throw new Error('HttpOnlyCrawler not found')
    }
    
    const crawler = new CrawlerClass(site.url, {
      maxListings: 20, // Limit to 20 listings per run to avoid rate limits
      saveToMongo: true
    })
    
    const result = await crawler.crawl()
    
    // Track stats
    if (!globalStats.websiteStats[site.provider]) {
      globalStats.websiteStats[site.provider] = {
        totalScraped: 0,
        totalNew: 0,
        totalErrors: 0,
        lastScrape: null
      }
    }
    
    globalStats.websiteStats[site.provider].totalScraped += result.totalScraped || 0
    globalStats.websiteStats[site.provider].totalNew += result.totalNew || 0
    globalStats.websiteStats[site.provider].totalErrors += result.totalErrors || 0
    globalStats.websiteStats[site.provider].lastScrape = new Date().toISOString()
    
    globalStats.totalScraped += result.totalScraped || 0
    globalStats.totalNew += result.totalNew || 0
    
    console.log(`✅ ${site.name}: ${result.totalScraped || 0} scraped, ${result.totalNew || 0} new`)
    
    return result
  } catch (error) {
    console.error(`❌ Error scraping ${site.name}:`, error.message)
    globalStats.errors.push({
      website: site.name,
      error: error.message,
      timestamp: new Date().toISOString()
    })
    return { totalScraped: 0, totalNew: 0, totalErrors: 1 }
  }
}

// Helper function to force MongoDB URI to mietenow-prod
function forceMongoUri(originalUri) {
  if (!originalUri) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  let uri = originalUri.trim().replace(/^['"]|['"]$/g, '')

  // Convertir mongodb+srv:// en mongodb:// si nécessaire
  if (uri.includes('mongodb+srv://')) {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?/)
    if (match) {
      const [, username, password, host, , query] = match
      const shardHost = process.env.MONGODB_URI2?.replace(/^['"]|['"]$/g, '').match(/@([^:]+):/)?.[1] || host
      // Retirer directConnection=true
      const cleanQuery = (query || '').replace(/[?&]directConnection=[^&]*/gi, '')
      uri = `mongodb://${username}:${password}@${shardHost}:27017/${DB_NAME}${cleanQuery || ''}`
    }
  } else {
    const uriMatch = uri.match(/^(mongodb:\/\/[^\/]+)\/?([^?]*)(\?.*)?$/)
    if (uriMatch) {
      const [, baseUri, , query] = uriMatch
      // Retirer directConnection=true
      const cleanQuery = (query || '').replace(/[?&]directConnection=[^&]*/gi, '')
      uri = `${baseUri}/${DB_NAME}${cleanQuery || ''}`
    }
  }

  // GARANTIR que mietenow-prod est dans l'URI et que "test" n'y est pas
  if (uri.includes('/test')) {
    uri = uri.replace(/\/test(\?|$)/, `/${DB_NAME}$1`)
  }

  if (!uri.includes(`/${DB_NAME}`)) {
    if (uri.includes('/?')) {
      uri = uri.replace('/?', `/${DB_NAME}?`)
    } else if (uri.endsWith('/')) {
      uri = uri + DB_NAME
    } else if (!uri.match(/\/[^\/\?]+(\?|$)/)) {
      uri = uri + '/' + DB_NAME
    }
  }

  return uri
}

// Get user alerts from database
async function getUserAlerts() {
  const forcedUri = forceMongoUri(MONGODB_URI)
  const client = new MongoClient(forcedUri)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    
    // VÉRIFICATION
    if (db.databaseName !== DB_NAME) {
      throw new Error(`CRITICAL: Connected to "${db.databaseName}" instead of "${DB_NAME}"`)
    }
    
    const alertsCollection = db.collection(ALERTS_COLLECTION)
    const usersCollection = db.collection(USERS_COLLECTION)
    
    // Get all active alerts with user info
    const alerts = await alertsCollection.find({ isActive: true }).toArray()
    const userIds = [...new Set(alerts.map(alert => alert.userId))]
    const users = await usersCollection.find({ _id: { $in: userIds } }).toArray()
    
    const userMap = new Map(users.map(user => [user._id.toString(), user]))
    
    return alerts.map(alert => ({
      ...alert,
      user: userMap.get(alert.userId.toString())
    })).filter(alert => alert.user) // Only alerts with valid users
    
  } catch (error) {
    console.error('❌ Error getting user alerts:', error.message)
    return []
  } finally {
    await client.close()
  }
}

// Get new listings from the last scraping session
async function getNewListings() {
  const forcedUri = forceMongoUri(MONGODB_URI)
  const client = new MongoClient(forcedUri)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    
    // VÉRIFICATION
    if (db.databaseName !== DB_NAME) {
      throw new Error(`CRITICAL: Connected to "${db.databaseName}" instead of "${DB_NAME}"`)
    }
    
    const collection = db.collection(COLLECTION_NAME)
    
    // Get listings from the last 5 minutes (new listings)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const newListings = await collection.find({
      $or: [
        { created_at: { $gte: fiveMinutesAgo } },
        { scraped_at: { $gte: fiveMinutesAgo } }
      ]
    }).toArray()
    
    return newListings
  } catch (error) {
    console.error('❌ Error getting new listings:', error.message)
    return []
  } finally {
    await client.close()
  }
}

// Send alert email to user
async function sendAlertEmail(alert, listing) {
  try {
    const user = alert.user
    const subject = `🏠 New Listing Alert: ${listing.title}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🏠 New Listing Alert</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${listing.title}</h3>
          <p><strong>Price:</strong> ${listing.price} €</p>
          <p><strong>Location:</strong> ${listing.location}</p>
          <p><strong>Type:</strong> ${listing.type}</p>
          <p><strong>Rooms:</strong> ${listing.rooms}</p>
          ${listing.size ? `<p><strong>Size:</strong> ${listing.size} m²</p>` : ''}
          ${listing.furnished !== undefined ? `<p><strong>Furnished:</strong> ${listing.furnished ? 'Yes' : 'No'}</p>` : ''}
        </div>
        
        <div style="margin: 20px 0;">
          <p><strong>Description:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
            ${listing.description || 'No description available'}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${listing.url_source}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Full Listing
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px;">
          This alert was triggered because the listing matches your search criteria.
        </p>
      </div>
    `
    
    await sendEmail({
      to: user.email,
      subject,
      html
    })
    
    console.log(`📧 Alert sent to ${user.email} for listing: ${listing.title}`)
    return true
    
  } catch (error) {
    console.error(`❌ Failed to send alert to ${alert.user.email}:`, error.message)
    return false
  }
}

// Check if listing matches alert criteria
function listingMatchesAlert(listing, alert) {
  const criteria = alert.searchCriteria || {}
  
  // Price range
  if (criteria.minPrice && listing.price < criteria.minPrice) return false
  if (criteria.maxPrice && listing.price > criteria.maxPrice) return false
  
  // Rooms
  if (criteria.minRooms && listing.rooms < criteria.minRooms) return false
  if (criteria.maxRooms && listing.rooms > criteria.maxRooms) return false
  
  // Size
  if (criteria.minSurface && listing.surface < criteria.minSurface) return false
  if (criteria.maxSurface && listing.surface > criteria.maxSurface) return false
  
  // Type
  if (criteria.type && criteria.type !== 'Any' && listing.type !== criteria.type) return false
  
  // Furnished
  if (criteria.furnishing && criteria.furnishing !== 'Any') {
    const isFurnished = criteria.furnishing === 'Furnished'
    if (listing.furnished !== isFurnished) return false
  }
  
  // Location (simplified - just check if it contains Berlin)
  if (criteria.city && criteria.city.toLowerCase() !== 'berlin') {
    const locationLower = (listing.location || '').toLowerCase()
    if (!locationLower.includes(criteria.city.toLowerCase())) return false
  }
  
  return true
}

// Send alerts for new listings
async function sendAlertsForNewListings() {
  console.log('\n📧 Checking for new listings to send alerts...')
  
  const newListings = await getNewListings()
  if (newListings.length === 0) {
    console.log('📧 No new listings found')
    return 0
  }
  
  console.log(`📧 Found ${newListings.length} new listings`)
  
  const alerts = await getUserAlerts()
  if (alerts.length === 0) {
    console.log('📧 No active alerts found')
    return 0
  }
  
  console.log(`📧 Found ${alerts.length} active alerts`)
  
  let alertsSent = 0
  
  for (const listing of newListings) {
    for (const alert of alerts) {
      if (listingMatchesAlert(listing, alert)) {
        const sent = await sendAlertEmail(alert, listing)
        if (sent) {
          alertsSent++
          globalStats.totalAlertsSent++
        }
      }
    }
  }
  
  console.log(`📧 Sent ${alertsSent} alerts for new listings`)
  return alertsSent
}

// Main scraping and alerting function
async function scrapeAndAlert() {
  // Vérifier si le scraping OpenAI est activé
  const OPENAI_SCRAPING_ENABLED = process.env.OPENAI_SCRAPING_ENABLED !== 'false'
  
  if (!OPENAI_SCRAPING_ENABLED) {
    console.log('⏸️  Scraping OpenAI est désactivé (OPENAI_SCRAPING_ENABLED=false)')
    console.log('   Pour réactiver, définissez OPENAI_SCRAPING_ENABLED=true dans les variables d\'environnement')
    return
  }
  
  console.log('\n🚀 Starting scraping and alerting cycle...')
  console.log(`📅 ${new Date().toISOString()}`)
  
  // Scrape websites with concurrency control
  const results = []
  const semaphore = new Array(RATE_LIMITS.maxConcurrentSites).fill(null)
  
  for (let i = 0; i < TOP_10_SITES.length; i += RATE_LIMITS.maxConcurrentSites) {
    const batch = TOP_10_SITES.slice(i, i + RATE_LIMITS.maxConcurrentSites)
    
    const batchPromises = batch.map(async (site) => {
      return await scrapeWebsite(site)
    })
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }
  
  // Send alerts for new listings
  await sendAlertsForNewListings()
  
  globalStats.lastRun = new Date().toISOString()
  saveStats()
  
  const totalScraped = results.reduce((sum, r) => sum + (r.totalScraped || 0), 0)
  const totalNew = results.reduce((sum, r) => sum + (r.totalNew || 0), 0)
  
  console.log(`\n✅ Scraping cycle completed: ${totalScraped} scraped, ${totalNew} new`)
}

// Main execution
async function main() {
  console.log('🚀 Starting Scrape & Alert Script...')
  
  loadStats()
  await scrapeAndAlert()
  
  console.log('✅ Scrape & Alert cycle completed')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { main as runScrapeAndAlert, scrapeAndAlert }
