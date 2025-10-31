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
  const forcedUri = forceMongoUri(MONGODB_URI)
  const client = new MongoClient(forcedUri)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    
    // VÉRIFICATION
    if (db.databaseName !== DB_NAME) {
      throw new Error(`CRITICAL: Connected to "${db.databaseName}" instead of "${DB_NAME}"`)
    }
    
    const listingsCollection = db.collection(COLLECTION_NAME)
    
    // Check both createdAt and scraped_at fields
    const newListings = await listingsCollection.find({
      $or: [
        { createdAt: { $gte: sinceDate } },
        { scraped_at: { $gte: sinceDate } },
        { created_at: { $gte: sinceDate } }
      ]
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
  const forcedUri = forceMongoUri(MONGODB_URI)
  const client = new MongoClient(forcedUri)
  try {
    console.log('\n📧 Checking for new listings to send alerts...')
    
    await client.connect()
    const db = client.db(DB_NAME)
    
    // VÉRIFICATION
    if (db.databaseName !== DB_NAME) {
      throw new Error(`CRITICAL: Connected to "${db.databaseName}" instead of "${DB_NAME}"`)
    }
    
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
        // Determine the cutoff date: use last_triggered_at if available, otherwise last 60 minutes
        // Use longer window to catch listings from recent scraping sessions
        const lastTriggered = alert.last_triggered_at ? new Date(alert.last_triggered_at) : null
        const fallbackWindow = 60 // minutes - longer window to catch recently scraped listings
        const sinceDate = lastTriggered || new Date(Date.now() - fallbackWindow * 60 * 1000)
        
        // If last_triggered_at is very recent (less than 5 minutes ago), use 60 minutes window anyway
        // This ensures we catch listings from the current scraping session
        const now = new Date()
        const timeSinceLastTrigger = lastTriggered ? (now - lastTriggered) / 1000 / 60 : 999
        const effectiveSinceDate = (lastTriggered && timeSinceLastTrigger > 5) 
          ? lastTriggered 
          : new Date(Date.now() - fallbackWindow * 60 * 1000)
        
        console.log(`📧 Checking for ${alert.email} (since ${effectiveSinceDate.toISOString()})`)
        
        // Get new listings created since last alert (or last 60 minutes)
        const newListings = await getNewListingsSince(effectiveSinceDate)
        
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

// Vérifier la connexion MongoDB avant de commencer
async function verifyMongoConnection() {
  const forcedUri = forceMongoUri(MONGODB_URI)
  
  // Options de connexion avec timeout plus long
  const client = new MongoClient(forcedUri, {
    serverSelectionTimeoutMS: 10000, // 10 secondes pour sélectionner le serveur
    connectTimeoutMS: 10000, // 10 secondes pour établir la connexion
    socketTimeoutMS: 30000, // 30 secondes pour les opérations socket
    maxPoolSize: 1, // Une seule connexion pour le test
    minPoolSize: 1
  })
  
  try {
    console.log('\n🔗 Vérification de la connexion MongoDB...')
    console.log(`   URI: ${forcedUri.replace(/:[^:@]+@/, ':****@')}`)
    
    // Connexion avec timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
      )
    ])
    
    // Test de ping pour vérifier que la connexion est vraiment active
    await client.db('admin').command({ ping: 1 })
    
    const db = client.db(DB_NAME)
    
    // VÉRIFICATION STRICTE
    if (db.databaseName !== DB_NAME) {
      throw new Error(`CRITICAL: Connected to "${db.databaseName}" instead of "${DB_NAME}"`)
    }
    
    // Test simple : compter les listings avec timeout
    const listingsCount = await Promise.race([
      db.collection(COLLECTION_NAME).countDocuments(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Count operation timeout')), 10000)
      )
    ]).catch(() => 0)
    
    console.log(`✅ Connexion MongoDB OK - Base: ${db.databaseName}, Listings: ${listingsCount}`)
    
    return true
  } catch (error) {
    console.error(`❌ ÉCHEC connexion MongoDB: ${error.message}`)
    console.error(`   Le scraping OpenAI ne sera PAS exécuté pour éviter des coûts inutiles`)
    
    // Log supplémentaire pour debug
    if (error.message.includes('closed') || error.message.includes('monitor')) {
      console.error(`   Problème de réseau ou timeout - Vérifie que MongoDB Atlas est accessible`)
    }
    
    return false
  } finally {
    try {
      await client.close()
    } catch (closeError) {
      // Ignorer les erreurs de fermeture
    }
  }
}

async function runOptimizedCron() {
  // Vérifier si le scraping OpenAI est activé
  const OPENAI_SCRAPING_ENABLED = process.env.OPENAI_SCRAPING_ENABLED !== 'false'
  
  if (!OPENAI_SCRAPING_ENABLED) {
    console.log('⏸️  Scraping OpenAI est désactivé (OPENAI_SCRAPING_ENABLED=false)')
    console.log('   Pour réactiver, définissez OPENAI_SCRAPING_ENABLED=true dans les variables d\'environnement')
    return
  }
  
  console.log('\n🚀 Starting Optimized Cron Job...')
  console.log(`📅 ${new Date().toISOString()}`)
  
  // VÉRIFICATION CRITIQUE: Connexion MongoDB avant de commencer
  const mongoConnected = await verifyMongoConnection()
  if (!mongoConnected) {
    console.error('\n❌ ARRÊT: Connexion MongoDB échouée - Scraping OpenAI annulé pour éviter des coûts inutiles')
    throw new Error('MongoDB connection failed - Scraping cancelled to avoid unnecessary OpenAI costs')
  }
  
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
