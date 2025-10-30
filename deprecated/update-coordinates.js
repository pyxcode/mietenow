#!/usr/bin/env node

/**
 * Update coordinates for all existing listings using OpenAI
 * This script will re-process all listings to get accurate coordinates
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient } from 'mongodb'
import { extractListingWithOpenAI } from '../lib/openai-extractor.js'

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

async function updateCoordinates() {
  console.log('🔄 Starting coordinate update for all listings...')
  
  const client = new MongoClient(mongoUriConverted)
  await client.connect()
  
  const db = client.db('mietenow-prod')
  const collection = db.collection('listings')
  
  // Get all active listings
  const listings = await collection.find({ active: { $ne: false } }).toArray()
  console.log(`📊 Found ${listings.length} listings to update`)
  
  let updated = 0
  let failed = 0
  
  for (const listing of listings) {
    try {
      console.log(`\n🔄 Processing: ${listing.title?.substring(0, 50)}...`)
      
      // Fetch the original HTML
      const response = await fetch(listing.url_source, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (!response.ok) {
        console.log(`   ❌ Failed to fetch: ${response.status}`)
        failed++
        continue
      }
      
      const html = await response.text()
      
      // Use OpenAI to extract updated data with better coordinates
      const updatedData = await extractListingWithOpenAI(html, listing.url_source)
      
      if (updatedData && updatedData.lat && updatedData.lng) {
        // Update the listing with new coordinates
        await collection.updateOne(
          { _id: listing._id },
          { 
            $set: { 
              lat: updatedData.lat,
              lng: updatedData.lng,
              address: updatedData.address || listing.address,
              location: updatedData.location || listing.location,
              district: updatedData.district || listing.district,
              updated_at: new Date()
            }
          }
        )
        
        console.log(`   ✅ Updated coordinates: (${updatedData.lat}, ${updatedData.lng})`)
        updated++
      } else {
        console.log(`   ⚠️ No coordinates extracted`)
        failed++
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
      failed++
    }
  }
  
  await client.close()
  
  console.log(`\n📊 Update complete:`)
  console.log(`   ✅ Updated: ${updated}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   📊 Total: ${listings.length}`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('update-coordinates.js')) {
  updateCoordinates()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Update failed:', error)
      process.exit(1)
    })
}

export { updateCoordinates }
