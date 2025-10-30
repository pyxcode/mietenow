#!/usr/bin/env node

/**
 * Cron Job - Scrape Berlin listings every minute
 * Scrapes new listings from TOP_20_SITES (Berlin only)
 * Saves stats to file for email reporting
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Import crawler
import { TOP_20_SITES, scrapeSite } from './multi-site-crawler.js'

const STATS_FILE = join(process.cwd(), 'logs', 'scraping-stats.json')

// Ensure logs directory exists
import { mkdirSync } from 'fs'
try {
  mkdirSync(join(process.cwd(), 'logs'), { recursive: true })
} catch (e) {
  // Directory might already exist
}

async function scrapeBerlinListings() {
  console.log('\n🕐 Starting Berlin scraping cycle...')
  console.log(`📅 ${new Date().toISOString()}`)
  
  const startTime = Date.now()
  const stats = {
    timestamp: new Date().toISOString(),
    cycleStart: startTime,
    sites: [],
    totalFound: 0,
    totalSaved: 0,
    errors: []
  }
  
  // Load previous stats to track new listings
  let previousStats = { lastCycleTime: null, lastSavedCount: 0 }
  if (existsSync(STATS_FILE)) {
    try {
      const prev = JSON.parse(readFileSync(STATS_FILE, 'utf8'))
      previousStats.lastCycleTime = prev.timestamp || null
      previousStats.lastSavedCount = prev.totalSaved || 0
    } catch (e) {
      console.log('⚠️ Could not load previous stats, starting fresh')
    }
  }
  
  // Scrape each site (only Berlin URLs)
  for (const site of TOP_20_SITES) {
    try {
      console.log(`\n🔍 Scraping: ${site.name}`)
      
      // Scrape ALL listings (no limit)
      const result = await scrapeSite(site, null)
      
      // Track stats
      stats.sites.push({
        name: site.name,
        url: site.url,
        success: result.success,
        error: result.error || null
      })
      
      // Delay between sites
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error) {
      console.error(`❌ Error scraping ${site.name}:`, error.message)
      stats.errors.push({
        site: site.name,
        error: error.message
      })
      stats.sites.push({
        name: site.name,
        url: site.url,
        success: false,
        error: error.message
      })
    }
  }
  
  // Get counts from MongoDB
  try {
    const { MongoClient } = await import('mongodb')
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI2
    let mongoUriConverted = mongoUri
    
    if (mongoUri && mongoUri.includes('mongodb+srv://')) {
      const match = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/)
      if (match) {
        const [, u, p, h, d, q] = match
        mongoUriConverted = `mongodb://${u}:${p}@${h}:27017/${d}${q || ''}`
      }
    }
    
    if (mongoUriConverted && mongoUriConverted.includes('/?') && !mongoUriConverted.includes('mietenow-prod')) {
      mongoUriConverted = mongoUriConverted.replace('/?', '/mietenow-prod?')
    } else if (mongoUriConverted && !mongoUriConverted.includes('mietenow-prod')) {
      mongoUriConverted = mongoUriConverted.replace(/\/[^/]*(\?|$)/, '/mietenow-prod$1')
    }
    
    const client = new MongoClient(mongoUriConverted)
    await client.connect()
    const db = client.db('mietenow-prod')
    const collection = db.collection('listings')
    
    // Count total active listings
    const totalActive = await collection.countDocuments({ active: { $ne: false } })
    
    // Count listings created in last 30 minutes (for this cycle report)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    const recentCount = await collection.countDocuments({
      active: { $ne: false },
      $or: [
        { createdAt: { $gte: thirtyMinutesAgo } },
        { scraped_at: { $gte: thirtyMinutesAgo } }
      ]
    })
    
    stats.totalFound = totalActive
    stats.totalSaved = recentCount
    
    await client.close()
    
    console.log(`\n📊 Stats:`)
    console.log(`   Total active listings: ${totalActive}`)
    console.log(`   New in last 30min: ${recentCount}`)
    
  } catch (error) {
    console.error('❌ Error getting MongoDB stats:', error.message)
    stats.errors.push({ type: 'mongo_stats', error: error.message })
  }
  
  // Load cumulative stats from file
  let cumulativeStats = { 
    cycles: [],
    totalScraped: 0,
    totalSaved: 0,
    lastReportTime: null
  }
  
  if (existsSync(STATS_FILE)) {
    try {
      cumulativeStats = JSON.parse(readFileSync(STATS_FILE, 'utf8'))
    } catch (e) {
      console.log('⚠️ Could not load cumulative stats, starting fresh')
    }
  }
  
  // Add this cycle to cumulative stats
  cumulativeStats.cycles.push(stats)
  cumulativeStats.lastCycleTime = new Date().toISOString()
  
  // Keep only last 60 cycles (1 hour of data if running every minute)
  if (cumulativeStats.cycles.length > 60) {
    cumulativeStats.cycles = cumulativeStats.cycles.slice(-60)
  }
  
  // Calculate totals for last 30受到
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
  const recentCycles = cumulativeStats.cycles.filter(c => {
    const cycleTime = new Date(c.timestamp).getTime()
    return cycleTime >= thirtyMinutesAgo
  })
  
  cumulativeStats.totalScraped = recentCycles.length
  cumulativeStats.totalSaved = stats.totalSaved // Latest count
  
  // Save stats to file
  writeFileSync(STATS_FILE, JSON.stringify(cumulativeStats, null, 2))
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`\n✅ Scraping cycle completed in ${duration}s`)
  console.log(`📄 Stats saved to: ${STATS_FILE}`)
  
  return stats
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cron-scrape-berlin-minute.js')) {
  scrapeBerlinListings()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Scraping cycle failed:', error)
      process.exit(1)
    })
}

export { scrapeBerlinListings }

