#!/usr/bin/env node

/**
 * Remove Student.com Listings Script
 * 
 * Supprime toutes les annonces qui proviennent de https://cn.student.com/
 * 
 * Usage: node scripts/remove-student-com-listings.js [--dry-run]
 *   --dry-run : Mode test - affiche ce qui serait supprimé sans supprimer réellement
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient } from 'mongodb'
import { writeFileSync, mkdirSync } from 'fs'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2
const DB_NAME = 'mietenow-prod'
const COLLECTION_NAME = 'listings'

// Check if --dry-run flag is set
const isDryRun = process.argv.includes('--dry-run')

async function removeStudentComListings() {
  console.log('🧹 Starting Student.com listings removal...')
  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE - No listings will be deleted')
  }
  console.log(`📅 ${new Date().toISOString()}\n`)

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not configured')
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)

    console.log('✅ Connected to MongoDB\n')

    // Find all listings from student.com or cn.student.com
    const studentComListings = await collection.find({
      url_source: {
        $regex: /student\.com/i  // Case insensitive match for student.com
      }
    }).toArray()

    console.log(`📊 Found ${studentComListings.length} listings from Student.com\n`)

    if (studentComListings.length === 0) {
      console.log('✅ No listings to remove')
      return
    }

    // Display found listings
    console.log('📋 Listings found from Student.com:')
    console.log('='.repeat(80))
    studentComListings.forEach((listing, index) => {
      console.log(`\n${index + 1}. ${listing.title || 'No title'}`)
      console.log(`   URL: ${listing.url_source}`)
      console.log(`   Price: ${listing.price || 'N/A'}€`)
      console.log(`   Location: ${listing.address || listing.location || 'N/A'}`)
      if (listing.scraped_at) {
        console.log(`   Scraped: ${new Date(listing.scraped_at).toLocaleDateString()}`)
      }
    })

    // Ensure logs directory exists
    const logsDir = 'logs'
    try {
      mkdirSync(logsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save listings to file before deletion
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const listingsPath = `${logsDir}/student-com-listings-${timestamp}.json`
    writeFileSync(listingsPath, JSON.stringify(studentComListings, null, 2))
    console.log(`\n📄 Listings saved to ${listingsPath}`)

    // Create simple URL file
    const urlsPath = `${logsDir}/student-com-urls-${timestamp}.txt`
    const urlsText = studentComListings
      .map((listing, index) => `${index + 1}. ${listing.title || 'No title'}\n   ${listing.url_source}\n`)
      .join('\n')
    writeFileSync(urlsPath, urlsText)
    console.log(`📋 URLs saved to ${urlsPath}\n`)

    if (isDryRun) {
      console.log('='.repeat(80))
      console.log('⚠️  DRY RUN MODE - No listings were deleted')
      console.log(`   Would have deleted ${studentComListings.length} listings`)
      console.log('   Run without --dry-run to actually delete them')
      return
    }

    // Ask for confirmation
    console.log('='.repeat(80))
    console.log(`⚠️  WARNING: This will delete ${studentComListings.length} listings!`)
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n')
    
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Delete listings
    console.log('🗑️  Deleting listings...\n')
    let deletedCount = 0
    let errors = 0

    for (const listing of studentComListings) {
      try {
        const result = await collection.deleteOne({ _id: listing._id })
        if (result.deletedCount > 0) {
          deletedCount++
          console.log(`   ✅ Deleted: ${listing.title?.substring(0, 60)}...`)
        }
      } catch (error) {
        errors++
        console.log(`   ❌ Error deleting ${listing._id}: ${error.message}`)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80))
    console.log('📊 REMOVAL SUMMARY')
    console.log('='.repeat(80))
    console.log(`Total found: ${studentComListings.length}`)
    console.log(`✅ Deleted: ${deletedCount}`)
    console.log(`❌ Errors: ${errors}`)
    console.log(`\n📄 Detailed listings saved to: ${listingsPath}`)
    console.log(`📋 URLs saved to: ${urlsPath}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

removeStudentComListings().catch(console.error)

