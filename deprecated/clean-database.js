#!/usr/bin/env node

/**
 * Database Cleaner - Supprime les faux listings (blogs, pages d'info, etc.)
 * Garde uniquement les vraies listings avec toutes les données requises
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import { MongoClient } from 'mongodb'
import * as cheerio from 'cheerio'

const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI2
const dbName = 'mietenow-prod'
const collectionName = 'listings'

/**
 * Vérifie si c'est une vraie page de listing
 */
function isValidListing(listing) {
  // 1. Vérifier les champs requis
  if (!listing.title || listing.title.length < 10) {
    return { valid: false, reason: 'Title too short or missing' }
  }
  
  // Price: requis et doit être valide
  if (!listing.price || listing.price < 50 || listing.price > 50000) {
    return { valid: false, reason: 'Invalid price' }
  }
  
  // Surface: optionnel mais si présent doit être valide (certaines chambres n'ont pas de surface)
  if (listing.surface !== undefined && listing.surface !== null) {
    if (listing.surface < 5 || listing.surface > 1000) {
      return { valid: false, reason: 'Invalid surface' }
    }
  }
  
  // Rooms: optionnel mais si présent doit être valide
  if (listing.rooms !== undefined && listing.rooms !== null) {
    if (listing.rooms < 0 || listing.rooms > 20) {
      return { valid: false, reason: 'Invalid rooms' }
    }
  }
  
  // Description: doit avoir au moins 30 caractères (certaines annonces peuvent être courtes)
  if (!listing.description || listing.description.length < 30) {
    return { valid: false, reason: 'Description too short' }
  }
  
  // 2. Vérifier que ce n'est pas un blog/article
  const titleLower = listing.title.toLowerCase()
  const descLower = (listing.description || '').toLowerCase()
  const urlLower = (listing.url_source || '').toLowerCase()
  
  const exclusionKeywords = [
    'blog', 'article', 'news', 'press', 'magazine',
    'impressum', 'datenschutz', 'privacy', 'legal',
    'about', 'contact', 'über uns', 'kontakt',
    'faq', 'help', 'hilfe', 'support',
    'login', 'signup', 'register', 'anmelden',
    'job', 'career', 'karriere', 'stellenangebot',
    '404', 'not found', 'seite nicht gefunden',
    'error', 'fehler', 'page not found'
  ]
  
  for (const keyword of exclusionKeywords) {
    if (titleLower.includes(keyword) || descLower.includes(keyword) || urlLower.includes(keyword)) {
      return { valid: false, reason: `Contains exclusion keyword: ${keyword}` }
    }
  }
  
  // 3. Vérifier que la description contient des mots-clés de listing
  const listingKeywords = [
    'miete', 'rent', 'wohnung', 'apartment',
    'preis', 'price', '€', 'eur',
    'm²', 'qm', 'surface', 'fläche',
    'zimmer', 'rooms', 'bedroom',
    'verfügbar', 'available'
  ]
  
  let keywordCount = 0
  for (const keyword of listingKeywords) {
    if (descLower.includes(keyword) || titleLower.includes(keyword)) {
      keywordCount++
    }
  }
  
  if (keywordCount < 2) {
    return { valid: false, reason: 'Not enough listing keywords' }
  }
  
  // 4. Vérifier l'URL
  if (listing.url_source) {
    const exclusionPatterns = [
      /\/blog\//,
      /\/article\//,
      /\/news\//,
      /\/about/,
      /\/contact/,
      /\/impressum/,
      /\/datenschutz/,
      /\/faq/,
      /\/help/,
      /\/login/,
      /\/jobs?/,
      /\/events?/,
      /\/shop/,
      /\/forum/,
      /\?cat=/,
      /\?tag=/,
      /\/category\//,
      /\/tag\//,
      /\/author\//,
      /\/search\?/,
      /\/feed/,
      /\.rss/,
      /\.xml$/,
    ]
    
    for (const pattern of exclusionPatterns) {
      if (pattern.test(listing.url_source.toLowerCase())) {
        return { valid: false, reason: 'URL matches exclusion pattern' }
      }
    }
  }
  
  // 5. Vérifier que le titre n'est pas trop générique
  const genericTitles = [
    'hier geht es',
    'seite nicht gefunden',
    'error',
    'welcome',
    'willkommen',
    'home',
    'startseite',
    'impressum',
    'datenschutz'
  ]
  
  for (const generic of genericTitles) {
    if (titleLower.includes(generic) && titleLower.length < 50) {
      return { valid: false, reason: 'Generic title' }
    }
  }
  
  return { valid: true }
}

async function cleanDatabase() {
  console.log('🧹 Nettoyage de la base de données...')
  console.log('='.repeat(60))
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found')
    process.exit(1)
  }

  // Convert mongodb+srv to mongodb if needed
  let mongoUriConverted = mongoUri
  if (mongoUri.includes('mongodb+srv://')) {
    const match = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/)
    if (match) {
      const [, username, password, host, database, query] = match
      mongoUriConverted = `mongodb://${username}:${password}@${host}:27017/${database}${query || ''}`
    }
  }

  // Replace database name if needed
  if (mongoUriConverted.includes('/?') && !mongoUriConverted.includes(dbName)) {
    mongoUriConverted = mongoUriConverted.replace('/?', `/${dbName}?`)
  } else if (!mongoUriConverted.includes(`/${dbName}`)) {
    mongoUriConverted = mongoUriConverted.replace(/\/[^/]*(\?|$)/, `/${dbName}$1`)
  }

  const client = new MongoClient(mongoUriConverted)
  
  try {
    await client.connect()
    console.log('✅ Connecté à MongoDB')
    
    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    
    // Compter tous les listings
    const totalCount = await collection.countDocuments({})
    console.log(`\n📊 Total listings avant nettoyage: ${totalCount}`)
    
    // Trouver tous les listings
    const allListings = await collection.find({}).toArray()
    console.log(`📋 Analyse de ${allListings.length} listings...\n`)
    
    const invalidListings = []
    const validListings = []
    
    for (const listing of allListings) {
      const validation = isValidListing(listing)
      if (!validation.valid) {
        invalidListings.push({
          _id: listing._id,
          title: listing.title?.substring(0, 50) || 'N/A',
          url: listing.url_source?.substring(0, 60) || 'N/A',
          reason: validation.reason
        })
      } else {
        validListings.push(listing._id)
      }
    }
    
    console.log(`\n📊 RÉSULTATS:`)
    console.log(`   ✅ Listings valides: ${validListings.length}`)
    console.log(`   ❌ Listings invalides: ${invalidListings.length}`)
    
    // Afficher quelques exemples de listings invalides
    if (invalidListings.length > 0) {
      console.log(`\n🔍 Exemples de listings invalides:`)
      invalidListings.slice(0, 10).forEach((item, i) => {
        console.log(`   ${i + 1}. ${item.title}`)
        console.log(`      URL: ${item.url}`)
        console.log(`      Raison: ${item.reason}\n`)
      })
    }
    
    // Supprimer les listings invalides
    if (invalidListings.length > 0) {
      console.log(`\n🗑️  Suppression de ${invalidListings.length} listings invalides...`)
      const idsToDelete = invalidListings.map(item => item._id)
      const deleteResult = await collection.deleteMany({ _id: { $in: idsToDelete } })
      console.log(`✅ ${deleteResult.deletedCount} listings supprimés`)
    }
    
    // Vérifier le résultat final
    const finalCount = await collection.countDocuments({})
    console.log(`\n📊 Total listings après nettoyage: ${finalCount}`)
    console.log(`📉 Réduction: ${totalCount - finalCount} listings supprimés`)
    
    console.log('\n✅ Nettoyage terminé!')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    await client.close()
    console.log('✅ Déconnecté de MongoDB')
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('clean-database.js')) {
  cleanDatabase()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erreur:', error)
      process.exit(1)
    })
}

export { cleanDatabase, isValidListing }

