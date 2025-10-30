#!/usr/bin/env node

/**
 * Optimized Cron Job
 * Runs every 5 minutes with smart rate limiting
 * Only uses GPT, no fallbacks
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { runOptimizedScraping } from './optimized-scraper.js'
import { checkAllWebsites } from './website-health-checker.js'
import { MongoClient } from 'mongodb'
import { sendEmail } from '../lib/sendgrid-esm.js'

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI2
const DB_NAME = 'mietenow-prod'
const COLLECTION_NAME = 'listings'

// Get user alerts from database
async function getUserAlerts() {
  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const alertsCollection = db.collection('alerts')
    
    const alerts = await alertsCollection.find({ 
      $or: [{ isActive: true }, { active: true }] 
    }).toArray()
    console.log(`📧 Found ${alerts.length} active alerts`)
    return alerts
  } catch (error) {
    console.error('❌ Error fetching alerts:', error)
    return []
  } finally {
    await client.close()
  }
}

// Get new listings created after a specific date
async function getNewListingsSince(sinceDate) {
  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const listingsCollection = db.collection(COLLECTION_NAME)
    
    const newListings = await listingsCollection.find({
      createdAt: { $gte: sinceDate }
    }).toArray()
    
    console.log(`📊 Found ${newListings.length} new listings since ${sinceDate.toISOString()}`)
    return newListings
  } catch (error) {
    console.error('❌ Error fetching new listings:', error)
    return []
  } finally {
    await client.close()
  }
}

// Send alerts to users
async function sendAlertsToUsers() {
  const client = new MongoClient(MONGODB_URI)
  try {
    console.log('\n📧 Checking for new listings to send alerts...')
    
    await client.connect()
    const db = client.db(DB_NAME)
    const alertsCollection = db.collection('alerts')
    
    const alerts = await alertsCollection.find({ 
      $or: [{ isActive: true }, { active: true }] 
    }).toArray()
    
    if (alerts.length === 0) {
      console.log('📧 No active alerts found')
      return
    }
    
    console.log(`📧 Found ${alerts.length} active alerts`)
    
    // Send alerts to each user
    for (const alert of alerts) {
      try {
        // Determine the cutoff date: use last_triggered_at if available, otherwise last 10 minutes
        const lastTriggered = alert.last_triggered_at ? new Date(alert.last_triggered_at) : null
        const fallbackWindow = 10 // minutes - matches cron frequency
        const sinceDate = lastTriggered || new Date(Date.now() - fallbackWindow * 60 * 1000)
        
        console.log(`📧 Checking for ${alert.email} (since ${sinceDate.toISOString()})`)
        
        // Get new listings created since last alert (or last 10 minutes)
        const newListings = await getNewListingsSince(sinceDate)
        
        if (newListings.length === 0) {
          console.log(`   No new listings since last alert for ${alert.email}`)
          continue
        }
        
        // Filter listings based on user preferences
        const matchingListings = newListings.filter(listing => {
          const minPrice = alert.minPrice !== undefined ? alert.minPrice : alert.criteria?.min_price
          const maxPrice = alert.maxPrice !== undefined ? alert.maxPrice : alert.criteria?.max_price
          
          if (minPrice !== undefined && minPrice !== null && listing.price < minPrice) return false
          if (maxPrice !== undefined && maxPrice !== null && listing.price > maxPrice) return false
          return true
        })
        
        if (matchingListings.length > 0) {
          console.log(`📧 Sending alert to ${alert.email} with ${matchingListings.length} matching listings`)
          
          const emailContent = generateEmailContent(matchingListings, alert)
          const result = await sendEmail({
            to: alert.email,
            subject: `🏠 ${matchingListings.length} New Rental Listings Found!`,
            html: emailContent
          })
          
          if (result.success) {
            // Update last_triggered_at in the alert
            await alertsCollection.updateOne(
              { _id: alert._id },
              { $set: { last_triggered_at: new Date() } }
            )
            console.log(`✅ Alert sent to ${alert.email} (updated last_triggered_at)`)
          } else {
            console.log(`❌ Failed to send alert to ${alert.email}: ${result.error}`)
          }
        } else {
          console.log(`   No matching listings for ${alert.email}`)
        }
      } catch (error) {
        console.error(`❌ Error sending alert to ${alert.email}:`, error)
      }
    }
  } catch (error) {
    console.error('❌ Error in sendAlertsToUsers:', error)
  } finally {
    await client.close()
  }
}

// Generate email content
function generateEmailContent(listings, alert) {
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #00BFA6;">🏠 New Rental Listings Found!</h2>
      <p>Hi ${alert.firstName || 'there'},</p>
      <p>We found <strong>${listings.length}</strong> new rental listings that match your criteria!</p>
      
      <div style="margin: 20px 0;">
  `
  
  listings.slice(0, 5).forEach((listing, index) => {
    html += `
      <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${listing.title || 'Rental Listing'}</h3>
        <p style="margin: 5px 0; color: #666;">
          <strong>Price:</strong> ${listing.price ? listing.price + '€' : 'N/A'} | 
          <strong>Type:</strong> ${listing.type || 'N/A'} | 
          <strong>Location:</strong> ${listing.location || 'N/A'}
        </p>
        ${listing.description ? `<p style="margin: 10px 0; color: #555;">${listing.description.substring(0, 200)}...</p>` : ''}
        <a href="${listing.url_source || '#'}" style="color: #00BFA6; text-decoration: none;">View Listing →</a>
      </div>
    `
  })
  
  if (listings.length > 5) {
    html += `<p style="text-align: center; margin: 20px 0;">
      <a href="https://mietenow.com/search" style="background: #00BFA6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View All ${listings.length} Listings</a>
    </p>`
  }
  
  html += `
      </div>
      <p style="color: #666; font-size: 14px;">
        You're receiving this because you have an active alert set up. 
        <a href="https://mietenow.com/dashboard">Manage your alerts</a>
      </p>
    </div>
  `
  
  return html
}

async function runOptimizedCron() {
  console.log('\n🚀 Starting Optimized Cron Job...')
  console.log(`📅 ${new Date().toISOString()}`)
  
  try {
    // First, check website health
    console.log('\n🔍 Checking website health...')
    const healthReport = await checkAllWebsites()
    
    // Only proceed if we have working websites
    const workingWebsites = healthReport.results.filter(r => r.status === 'working')
    
    if (workingWebsites.length === 0) {
      console.log('❌ No working websites found, skipping scraping')
      return
    }
    
    console.log(`✅ Found ${workingWebsites.length} working websites`)
    
    // Run optimized scraping
    console.log('\n🔍 Starting optimized scraping...')
    const scrapingStats = await runOptimizedScraping()
    
    // Send email alerts for new listings
    await sendAlertsToUsers()
    
    console.log('\n✅ Optimized cron job completed!')
    console.log(`📊 Final stats: ${scrapingStats.totalScraped} scraped, ${scrapingStats.totalNew} new`)
    
  } catch (error) {
    console.error('❌ Optimized cron job failed:', error)
    throw error
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('optimized-cron.js')) {
  runOptimizedCron()
    .then(() => {
      console.log('\n✅ Optimized cron completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Optimized cron failed:', error)
      process.exit(1)
    })
}

export { runOptimizedCron }
