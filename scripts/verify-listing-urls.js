#!/usr/bin/env node

/**
 * Verify Listing URLs Script
 * 
 * Test a few listing URLs to see their actual HTTP status codes
 * This helps verify if listings were incorrectly removed
 * 
 * Usage: node scripts/verify-listing-urls.js [limit]
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2
const DB_NAME = 'mietenow-prod'
const COLLECTION_NAME = 'listings'

async function verifyUrls(limit = 20) {
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
    console.log(`\n🔍 Checking first ${limit} listings...\n`)

    const listings = await collection.find({ url_source: { $exists: true } })
      .limit(limit)
      .toArray()

    console.log(`📊 Found ${listings.length} listings to check\n`)

    const results = {
      total: listings.length,
      accessible: 0,
      notFound: 0,
      serverError: 0,
      clientError: 0,
      networkError: 0,
      statusCodes: {}
    }

    for (const listing of listings) {
      const url = listing.url_source
      console.log(`\n🔗 Testing: ${listing.title?.substring(0, 60)}...`)
      console.log(`   URL: ${url}`)

      try {
        const response = await fetch(url, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        })

        const status = response.status
        results.statusCodes[status] = (results.statusCodes[status] || 0) + 1

        if (response.ok) {
          results.accessible++
          console.log(`   ✅ Status: ${status} - ACCESSIBLE`)
        } else if (status === 404) {
          results.notFound++
          console.log(`   ❌ Status: ${status} - NOT FOUND (should be removed)`)
        } else if (status >= 500) {
          results.serverError++
          console.log(`   ⚠️  Status: ${status} - SERVER ERROR (temporary, should NOT be removed)`)
        } else if (status >= 400) {
          results.clientError++
          console.log(`   ⚠️  Status: ${status} - CLIENT ERROR (should NOT be removed)`)
        } else {
          console.log(`   🔍 Status: ${status}`)
        }
      } catch (error) {
        results.networkError++
        results.statusCodes['error'] = (results.statusCodes['error'] || 0) + 1
        console.log(`   ❌ Network/Timeout Error: ${error.message}`)
        console.log(`   ⚠️  Should NOT be removed (temporary error)`)
      }

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log('\n' + '='.repeat(70))
    console.log('📊 VERIFICATION SUMMARY')
    console.log('='.repeat(70))
    console.log(`Total checked: ${results.total}`)
    console.log(`✅ Accessible (200-299): ${results.accessible}`)
    console.log(`❌ Not Found (404): ${results.notFound}`)
    console.log(`⚠️  Server Errors (500+): ${results.serverError}`)
    console.log(`⚠️  Client Errors (400-499, excluding 404): ${results.clientError}`)
    console.log(`❌ Network Errors: ${results.networkError}`)
    console.log('\n📈 Status Code Breakdown:')
    Object.entries(results.statusCodes)
      .sort((a, b) => {
        if (a[0] === 'error') return 1
        if (b[0] === 'error') return -1
        return parseInt(a[0]) - parseInt(b[0])
      })
      .forEach(([code, count]) => {
        const emoji = code === 'error' ? '❌' : 
                     parseInt(code) === 200 ? '✅' : 
                     parseInt(code) === 404 ? '❌' : 
                     parseInt(code) >= 500 ? '⚠️' : '🔍'
        console.log(`  ${emoji} ${code}: ${count}`)
      })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

// Get limit from command line or use default
const limit = parseInt(process.argv[2]) || 20

verifyUrls(limit).catch(console.error)

