#!/usr/bin/env node
/**
 * Verify alert structure and test matching logic
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2
const DB_NAME = 'mietenow-prod'

// Helper function to force MongoDB URI to mietenow-prod
function forceMongoUri(originalUri) {
  if (!originalUri) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  let uri = originalUri.trim().replace(/^['"]|['"]$/g, '')

  if (uri.includes('mongodb+srv://')) {
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)?(\?.*)?/)
    if (match) {
      const [, username, password, host, , query] = match
      const shardHost = process.env.MONGODB_URI2?.replace(/^['"]|['"]$/g, '').match(/@([^:]+):/)?.[1] || host
      const cleanQuery = (query || '').replace(/[?&]directConnection=[^&]*/gi, '')
      uri = `mongodb://${username}:${password}@${shardHost}:27017/${DB_NAME}${cleanQuery || ''}`
    }
  } else {
    const uriMatch = uri.match(/^(mongodb:\/\/[^\/]+)\/?([^?]*)(\?.*)?$/)
    if (uriMatch) {
      const [, baseUri, , query] = uriMatch
      const cleanQuery = (query || '').replace(/[?&]directConnection=[^&]*/gi, '')
      uri = `${baseUri}/${DB_NAME}${cleanQuery || ''}`
    }
  }

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

async function verifyAlert() {
  const forcedUri = forceMongoUri(MONGODB_URI)
  const client = new MongoClient(forcedUri)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    
    // VÉRIFICATION
    if (db.databaseName !== DB_NAME) {
      throw new Error(`CRITICAL: Connected to "${db.databaseName}" instead of "${DB_NAME}"`)
    }
    const alertsCollection = db.collection('alerts')
    const listingsCollection = db.collection('listings')
    
    // Find the alert for louan@pjie.fr
    const alert = await alertsCollection.findOne({ email: 'louan@pjie.fr' })
    
    if (!alert) {
      console.log('❌ Alert not found for louan@pjie.fr')
      return
    }
    
    console.log('\n📋 ALERT STRUCTURE:')
    console.log('='.repeat(60))
    console.log(`Email: ${alert.email}`)
    console.log(`Title: ${alert.title || 'MISSING'}`)
    console.log(`Active: ${alert.active} (isActive: ${alert.isActive})`)
    console.log(`Frequency: ${alert.frequency || 'MISSING'}`)
    console.log(`Min Price: ${alert.minPrice !== undefined ? alert.minPrice : (alert.criteria?.min_price !== undefined ? alert.criteria.min_price : 'MISSING')}`)
    console.log(`Max Price: ${alert.maxPrice !== undefined ? alert.maxPrice : (alert.criteria?.max_price !== undefined ? alert.criteria.max_price : 'MISSING')}`)
    
    if (alert.criteria) {
      console.log('\n📊 Criteria:')
      console.log(JSON.stringify(alert.criteria, null, 2))
    } else {
      console.log('\n⚠️  Criteria object MISSING!')
    }
    
    // Test query that cron uses
    console.log('\n🔍 Testing cron query...')
    const cronAlerts = await alertsCollection.find({ 
      $or: [{ isActive: true }, { active: true }] 
    }).toArray()
    
    console.log(`Found ${cronAlerts.length} active alerts:`)
    cronAlerts.forEach(a => {
      console.log(`  - ${a.email} (active: ${a.active}, isActive: ${a.isActive})`)
    })
    
    // Test matching with new listings
    console.log('\n🔍 Testing matching logic...')
    const windowMinutes = 60
    const since = new Date(Date.now() - windowMinutes * 60 * 1000)
    const newListings = await listingsCollection.find({
      createdAt: { $gte: since }
    }).limit(10).toArray()
    
    console.log(`Found ${newListings.length} sample listings from last ${windowMinutes} minutes`)
    
    const matchingListings = newListings.filter(listing => {
      const minPrice = alert.minPrice !== undefined ? alert.minPrice : alert.criteria?.min_price
      const maxPrice = alert.maxPrice !== undefined ? alert.maxPrice : alert.criteria?.max_price
      
      if (minPrice !== undefined && minPrice !== null && listing.price < minPrice) return false
      if (maxPrice !== undefined && maxPrice !== null && listing.price > maxPrice) return false
      return true
    })
    
    console.log(`\n✅ Matching: ${matchingListings.length} out of ${newListings.length} listings match`)
    
    if (matchingListings.length > 0) {
      console.log('\n📋 Sample matching listings:')
      matchingListings.slice(0, 3).forEach((listing, i) => {
        console.log(`  ${i + 1}. ${listing.title} - ${listing.price}€ - ${listing.location}`)
      })
      console.log(`\n✅ Alert would trigger with ${matchingListings.length} matching listings!`)
    }
    
    console.log('\n' + '='.repeat(60))
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

verifyAlert()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

