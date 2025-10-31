#!/usr/bin/env node

/**
 * Optimized Scraper with Smart Rate Limiting
 * Bypasses OpenAI rate limits with intelligent scheduling
 */

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

// Smart rate limiting configuration
const RATE_LIMITS = {
  // OpenAI rate limits: ~3000 requests/minute for gpt-4.1-nano
  maxOpenAICallsPerMinute: 50, // Conservative limit
  maxOpenAICallsPerHour: 2000, // Stay well under limit
  delayBetweenSites: 30000, // 30 seconds between sites
  delayBetweenListings: 2000, // 2 seconds between listings
  maxListingsPerSite: 5, // Reduced from 20 to 5
  maxConcurrentSites: 1, // Process one site at a time
  retryDelay: 60000, // 1 minute retry delay
  maxRetries: 3
}

// Track OpenAI usage
let openAICallCount = 0
let lastResetTime = Date.now()
const hourlyCallCount = { count: 0, resetTime: Date.now() }

// Rate limiter class
class SmartRateLimiter {
  constructor() {
    this.lastRequest = 0
    this.requestCount = 0
    this.resetTime = Date.now()
  }

  async waitIfNeeded() {
    const now = Date.now()
    
    // Reset counters every minute
    if (now - this.resetTime > 60000) {
      this.requestCount = 0
      this.resetTime = now
    }
    
    // Reset hourly counter
    if (now - hourlyCallCount.resetTime > 3600000) {
      hourlyCallCount.count = 0
      hourlyCallCount.resetTime = now
    }
    
    // Check if we've hit limits
    if (this.requestCount >= RATE_LIMITS.maxOpenAICallsPerMinute) {
      const waitTime = 60000 - (now - this.resetTime)
      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached, waiting ${Math.ceil(waitTime/1000)}s...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        this.requestCount = 0
        this.resetTime = Date.now()
      }
    }
    
    if (hourlyCallCount.count >= RATE_LIMITS.maxOpenAICallsPerHour) {
      const waitTime = 3600000 - (now - hourlyCallCount.resetTime)
      if (waitTime > 0) {
        console.log(`⏳ Hourly rate limit reached, waiting ${Math.ceil(waitTime/60000)} minutes...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        hourlyCallCount.count = 0
        hourlyCallCount.resetTime = Date.now()
      }
    }
    
    // Wait between requests
    const timeSinceLastRequest = now - this.lastRequest
    if (timeSinceLastRequest < RATE_LIMITS.delayBetweenListings) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.delayBetweenListings - timeSinceLastRequest))
    }
    
    this.lastRequest = Date.now()
    this.requestCount++
    hourlyCallCount.count++
  }
}

// Create rate limiter
const rateLimiter = new SmartRateLimiter()

// Global stats
const globalStats = {
  totalScraped: 0,
  totalNew: 0,
  totalErrors: 0,
  websiteStats: {},
  errors: [],
  startTime: new Date().toISOString(),
  openAICalls: 0
}

// Scrape a single website with smart rate limiting
async function scrapeWebsite(site) {
  try {
    console.log(`\n🔍 Scraping: ${site.name}`)
    console.log(`📊 OpenAI calls this hour: ${hourlyCallCount.count}/${RATE_LIMITS.maxOpenAICallsPerHour}`)
    
    const CrawlerClass = await initCrawler()
    if (!CrawlerClass) {
      throw new Error('HttpOnlyCrawler not found')
    }
    
    // Create custom crawler with reduced listings
    const crawler = new CrawlerClass(site.url, {
      maxListings: RATE_LIMITS.maxListingsPerSite, // Only 5 listings per site
      saveToMongo: true,
      rateLimiter: rateLimiter // Pass rate limiter to crawler
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
    globalStats.openAICalls += result.openAICalls || 0
    
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

// Main scraping function with smart scheduling
async function runOptimizedScraping() {
  console.log('\n🚀 Starting Optimized Scraping...')
  console.log(`📅 ${new Date().toISOString()}`)
  console.log(`🎯 Max listings per site: ${RATE_LIMITS.maxListingsPerSite}`)
  console.log(`⏱️ OpenAI calls per hour: ${hourlyCallCount.count}/${RATE_LIMITS.maxOpenAICallsPerHour}`)
  
  const results = []
  
  // Process sites one by one to avoid rate limits
  for (let i = 0; i < TOP_10_SITES.length; i++) {
    const site = TOP_10_SITES[i]
    
    try {
      console.log(`\n📍 Processing site ${i + 1}/${TOP_10_SITES.length}: ${site.name}`)
      
      const result = await scrapeWebsite(site)
      results.push({
        ...result,
        site: site.name,
        provider: site.provider
      })
      
      // Wait between sites to respect rate limits
      if (i < TOP_10_SITES.length - 1) {
        console.log(`⏳ Waiting ${RATE_LIMITS.delayBetweenSites/1000}s before next site...`)
        await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.delayBetweenSites))
      }
      
    } catch (error) {
      console.error(`❌ Failed to scrape ${site.name}:`, error)
      results.push({
        totalScraped: 0,
        totalNew: 0,
        totalErrors: 1,
        site: site.name,
        provider: site.provider,
        error: error.message
      })
    }
  }
  
  // Generate summary
  const endTime = new Date()
  const duration = Math.round((endTime - new Date(globalStats.startTime)) / 1000)
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 OPTIMIZED SCRAPING SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total sites processed: ${TOP_10_SITES.length}`)
  console.log(`Total scraped: ${globalStats.totalScraped}`)
  console.log(`Total new: ${globalStats.totalNew}`)
  console.log(`Total errors: ${globalStats.totalErrors}`)
  console.log(`OpenAI calls used: ${globalStats.openAICalls}`)
  console.log(`Duration: ${duration} seconds`)
  console.log('\nPer-site results:')
  
  results.forEach((result, index) => {
    const status = result.totalErrors === 0 ? '✅' : '❌'
    console.log(`${status} ${index + 1}. ${result.site}: ${result.totalScraped} scraped, ${result.totalNew} new`)
  })
  
  // Save stats
  const statsData = {
    timestamp: endTime.toISOString(),
    duration: `${duration} seconds`,
    totalScraped: globalStats.totalScraped,
    totalNew: globalStats.totalNew,
    totalErrors: globalStats.totalErrors,
    openAICalls: globalStats.openAICalls,
    websiteStats: globalStats.websiteStats,
    errors: globalStats.errors
  }
  
  writeFileSync('optimized-scraping-stats.json', JSON.stringify(statsData, null, 2))
  console.log(`\n📄 Stats saved to: optimized-scraping-stats.json`)
  
  return statsData
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('optimized-scraper.js')) {
  runOptimizedScraping()
    .then((stats) => {
      console.log('\n✅ Optimized scraping completed!')
      console.log(`📊 Final stats: ${stats.totalScraped} scraped, ${stats.totalNew} new`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Optimized scraping failed:', error)
      process.exit(1)
    })
}

export { runOptimizedScraping, RATE_LIMITS }
