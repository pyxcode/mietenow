#!/usr/bin/env node

/**
 * Database Cleanup Script
 * 
 * Runs every night to clean up:
 * - Listings that no longer exist (404 errors)
 * - Invalid listings
 * - Old inactive listings
 * 
 * Usage: node scripts/cleanup-database.js
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient } from 'mongodb'
import { writeFileSync, mkdirSync } from 'fs'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2
const DB_NAME = 'mietenow-prod'
const COLLECTION_NAME = 'listings'

// Cleanup statistics
let stats = {
  startTime: new Date(),
  totalChecked: 0,
  removed: 0,
  errors: 0,
  reasons: {
    notFound: 0,    // Only real 404 errors
    invalid: 0,
    old: 0
  },
  statusCodes: {},  // Track all HTTP status codes encountered
  skippedTemporary: 0,  // Count of listings skipped due to temporary errors (503, 500, etc.)
  removedListings: []  // Store removed listings for verification
}

// Check if a listing URL is still accessible
async function checkListingUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })
    
    return {
      accessible: response.ok,
      status: response.status,
      error: null
    }
  } catch (error) {
    return {
      accessible: false,
      status: 0,
      error: error.message
    }
  }
}

// Check if a listing is valid
function isValidListing(listing) {
  // Must have essential fields
  if (!listing.title || !listing.price || !listing.url_source) {
    return false
  }
  
  // Price must be a positive number
  if (typeof listing.price !== 'number' || listing.price <= 0) {
    return false
  }
  
  // Title must not be too short or generic
  if (listing.title.length < 10) {
    return false
  }
  
  // Must not be a test or invalid listing
  const invalidKeywords = ['test', 'example', 'sample', 'invalid', 'error']
  const titleLower = listing.title.toLowerCase()
  if (invalidKeywords.some(keyword => titleLower.includes(keyword))) {
    return false
  }
  
  return true
}

// Check if a listing is too old
function isOldListing(listing) {
  const now = new Date()
  const listingDate = new Date(listing.scraped_at || listing.created_at || listing.last_seen_at)
  const daysSinceScraped = (now - listingDate) / (1000 * 60 * 60 * 24)
  
  // Remove listings older than 90 days
  return daysSinceScraped > 90
}

// Main cleanup function
async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...')
  console.log(`📅 ${stats.startTime.toISOString()}`)
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not configured')
    process.exit(1)
  }
  
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)
    
    console.log('✅ Connected to MongoDB')
    
    // Get all listings
    const listings = await collection.find({}).toArray()
    console.log(`📊 Found ${listings.length} listings to check`)
    
    stats.totalChecked = listings.length
    
    // Process listings in batches to avoid overwhelming the system
    const batchSize = 10
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize)
      
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(listings.length / batchSize)}`)
      
      for (const listing of batch) {
        console.log(`   Checking: ${listing.title?.substring(0, 50)}...`)
        
        let shouldRemove = false
        let reason = ''
        let httpStatus = null
        let httpError = null
        
        // Check if listing is valid
        if (!isValidListing(listing)) {
          shouldRemove = true
          reason = 'invalid'
          stats.reasons.invalid++
        }
        // Check if listing is too old
        else if (isOldListing(listing)) {
          shouldRemove = true
          reason = 'old'
          stats.reasons.old++
        }
        // Check if URL is still accessible
        else if (listing.url_source) {
          const urlCheck = await checkListingUrl(listing.url_source)
          
          httpStatus = urlCheck.status
          httpError = urlCheck.error
          
          // Track status code statistics
          const statusCode = urlCheck.status || 'error'
          stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1
          
          if (!urlCheck.accessible) {
            // Only remove if it's a real 404 (not found)
            // Don't remove for temporary errors like 503 (Service Unavailable), 500 (Server Error), etc.
            if (urlCheck.status === 404) {
              shouldRemove = true
              reason = 'notFound'
              stats.reasons.notFound++
              console.log(`     ❌ URL not found (404): ${listing.url_source}`)
            } else if (urlCheck.status >= 500 || urlCheck.status === 503) {
              // Temporary server error - skip removal
              stats.skippedTemporary++
              console.log(`     ⚠️  Temporary error (${urlCheck.status}) - keeping listing: ${listing.url_source}`)
            } else if (urlCheck.status === 0 || urlCheck.error) {
              // Network/timeout error - skip removal
              stats.skippedTemporary++
              console.log(`     ⚠️  Network error - keeping listing: ${urlCheck.error || 'timeout'}`)
            } else {
              // Other client errors (403, 401, etc.) - skip removal to be safe
              stats.skippedTemporary++
              console.log(`     ⚠️  Client error (${urlCheck.status}) - keeping listing`)
            }
          }
        }
        
        if (shouldRemove) {
          try {
            // Store listing info before deletion
            stats.removedListings.push({
              title: listing.title,
              url: listing.url_source,
              reason: reason,
              httpStatus: httpStatus,
              httpError: httpError,
              removedAt: new Date().toISOString()
            })
            
            await collection.deleteOne({ _id: listing._id })
            stats.removed++
            console.log(`     🗑️  Removed (${reason}): ${listing.title?.substring(0, 30)}...`)
          } catch (error) {
            console.log(`     ❌ Error removing listing: ${error.message}`)
            stats.errors++
          }
        } else {
          console.log(`     ✅ Keeping: ${listing.title?.substring(0, 30)}...`)
        }
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    // Update statistics
    stats.endTime = new Date()
    stats.duration = stats.endTime - stats.startTime
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 CLEANUP SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total checked: ${stats.totalChecked}`)
    console.log(`Total removed: ${stats.removed}`)
    console.log(`Errors: ${stats.errors}`)
    console.log(`Duration: ${Math.round(stats.duration / 1000)}s`)
    console.log('\nReasons for removal:')
    console.log(`  - Not found (404 only): ${stats.reasons.notFound}`)
    console.log(`  - Invalid data: ${stats.reasons.invalid}`)
    console.log(`  - Too old (>90 days): ${stats.reasons.old}`)
    console.log(`\n⚠️  Skipped (temporary errors): ${stats.skippedTemporary}`)
    console.log('\nHTTP Status codes encountered:')
    Object.entries(stats.statusCodes)
      .sort((a, b) => b[1] - a[1])  // Sort by count descending
      .forEach(([code, count]) => {
        const emoji = code === '200' ? '✅' : code === '404' ? '❌' : code === '503' ? '⚠️' : '🔍'
        console.log(`  ${emoji} ${code}: ${count}`)
      })
    
    // Ensure logs directory exists
    const logsDir = 'logs'
    try {
      mkdirSync(logsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
    
    // Save cleanup report with full details
    const report = {
      timestamp: stats.startTime.toISOString(),
      ...stats
    }
    
    const reportPath = `${logsDir}/cleanup-report.json`
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Cleanup report saved to ${reportPath}`)
    
    // Save removed listings URLs in a simple text file for easy verification
    if (stats.removedListings.length > 0) {
      const urlsPath = `${logsDir}/removed-listings-urls.txt`
      const urlsText = stats.removedListings
        .map(listing => `# ${listing.title}\n# Reason: ${listing.reason} | HTTP Status: ${listing.httpStatus || 'N/A'}\n${listing.url}\n`)
        .join('\n')
      
      writeFileSync(urlsPath, urlsText)
      console.log(`📋 Removed listings URLs saved to ${urlsPath}`)
      console.log(`   ${stats.removedListings.length} URLs saved for manual verification`)
      
      // Also save detailed JSON of removed listings
      const removedListingsPath = `${logsDir}/removed-listings-details.json`
      writeFileSync(removedListingsPath, JSON.stringify(stats.removedListings, null, 2))
      console.log(`📋 Detailed removed listings saved to ${removedListingsPath}`)
    }
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message)
    stats.errors++
  } finally {
    await client.close()
    console.log('✅ Disconnected from MongoDB')
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupDatabase().catch(console.error)
}

export { cleanupDatabase }
