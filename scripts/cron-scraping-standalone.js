#!/usr/bin/env node

/**
 * Script de scraping standalone qui ne dépend pas du serveur Next.js
 * Utilise directement les scrapers sans passer par l'API
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Importer les scrapers directement
const { ScraperManager } = require('../lib/scrapers/core/scraper-manager.js')

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'cron-scraping-standalone.log')

// Créer le dossier de logs s'il n'existe pas
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

function log(message) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  
  console.log(logMessage.trim())
  fs.appendFileSync(LOG_FILE, logMessage)
}

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables')
    }
    
    const baseUri = mongoUri.endsWith('/') ? mongoUri.slice(0, -1) : mongoUri
    const fullUri = `${baseUri}/mietenow-prod`
    
    await mongoose.connect(fullUri)
    log('✅ Connecté à MongoDB')
  } catch (error) {
    log(`❌ Erreur de connexion MongoDB: ${error.message}`)
    throw error
  }
}

async function checkListingStatuses() {
  try {
    log('🔍 Vérification du statut des annonces...')
    
    // Importer le modèle Listing
    const Listing = require('./models/Listing.js')
    
    // Récupérer toutes les annonces actives
    const listings = await Listing.find({ 
      active: { $ne: false } 
    }).limit(50) // Limiter pour éviter de surcharger
    
    const results = {
      total: listings.length,
      checked: 0,
      removed: 0,
      errors: 0
    }
    
    // Vérifier chaque annonce
    for (const listing of listings) {
      try {
        results.checked++
        
        // Vérifier si le lien est accessible
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch(listing.link, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MieteNow/1.0)'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          // Marquer l'annonce comme inactive
          await Listing.findByIdAndUpdate(listing._id, { 
            active: false,
            status_checked_at: new Date(),
            status_error: `HTTP ${response.status}`
          })
          
          results.removed++
          log(`❌ Annonce ${listing._id} désactivée: HTTP ${response.status}`)
        } else {
          // Mettre à jour la date de vérification
          await Listing.findByIdAndUpdate(listing._id, { 
            status_checked_at: new Date(),
            status_error: null
          })
          
          log(`✅ Annonce ${listing._id} vérifiée: HTTP ${response.status}`)
        }
        
        // Pause entre les vérifications
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        results.errors++
        log(`❌ Erreur lors de la vérification de l'annonce ${listing._id}: ${error.message}`)
      }
    }
    
    log(`📊 Vérification terminée: ${results.checked} vérifiées, ${results.removed} supprimées, ${results.errors} erreurs`)
    return results
    
  } catch (error) {
    log(`❌ Erreur lors de la vérification des statuts: ${error.message}`)
    throw error
  }
}

async function runScraping() {
  try {
    log('🚀 Démarrage du scraping...')
    
    const manager = new ScraperManager()
    const results = await manager.scrapeAll()
    
    log(`✅ Scraping terminé: ${JSON.stringify(results)}`)
    return results
    
  } catch (error) {
    log(`❌ Erreur lors du scraping: ${error.message}`)
    throw error
  }
}

async function cleanupOldListings() {
  try {
    log('🧹 Nettoyage des anciennes annonces...')
    
    const Listing = require('./models/Listing.js')
    
    // Supprimer les annonces plus anciennes que 30 jours
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const result = await Listing.deleteMany({
      created_at: { $lt: thirtyDaysAgo }
    })
    
    log(`🗑️ ${result.deletedCount} anciennes annonces supprimées`)
    return result.deletedCount
    
  } catch (error) {
    log(`❌ Erreur lors du nettoyage: ${error.message}`)
    throw error
  }
}

async function main() {
  const startTime = new Date()
  log(`🚀 Début du cron de scraping standalone - ${startTime.toISOString()}`)
  
  try {
    await connectDB()
    
    // 1. Vérifier les statuts des annonces
    const statusResults = await checkListingStatuses()
    
    // 2. Lancer le scraping
    const scrapingResults = await runScraping()
    
    // 3. Nettoyer les anciennes annonces
    const cleanupCount = await cleanupOldListings()
    
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    
    log(`🎉 Cron terminé avec succès en ${duration}ms`)
    log(`📊 Résumé: ${statusResults.checked} vérifiées, ${statusResults.removed} supprimées, ${cleanupCount} anciennes supprimées`)
    
  } catch (error) {
    log(`❌ Erreur fatale: ${error.message}`)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    log('✅ Déconnecté de MongoDB')
  }
}

// Exécuter le script
main().catch(console.error)
