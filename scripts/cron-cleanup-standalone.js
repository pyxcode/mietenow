#!/usr/bin/env node

/**
 * Script de cleanup standalone qui ne dépend pas du serveur Next.js
 * Nettoie les annonces expirées et les anciennes annonces
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'cron-cleanup-standalone.log')

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

async function checkAndRemove404Listings() {
  try {
    log('🔍 Vérification des annonces 404/erreur...')
    
    const Listing = require('./models/Listing.js')
    
    // Récupérer les annonces actives
    const listings = await Listing.find({ 
      active: { $ne: false } 
    }).limit(100)
    
    const results = {
      total: listings.length,
      checked: 0,
      removed: 0,
      errors: 0
    }
    
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
    
    log(`📊 Vérification 404 terminée: ${results.checked} vérifiées, ${results.removed} supprimées, ${results.errors} erreurs`)
    return results
    
  } catch (error) {
    log(`❌ Erreur lors de la vérification 404: ${error.message}`)
    throw error
  }
}

async function removeOldListings() {
  try {
    log('🗑️ Suppression des annonces anciennes (>30 jours)...')
    
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
    log(`❌ Erreur lors de la suppression des anciennes annonces: ${error.message}`)
    throw error
  }
}

async function getCleanupStats() {
  try {
    const Listing = require('./models/Listing.js')
    
    // Statistiques générales
    const totalListings = await Listing.countDocuments()
    const activeListings = await Listing.countDocuments({ active: { $ne: false } })
    const inactiveListings = await Listing.countDocuments({ active: false })
    
    // Annonces par plateforme
    const byPlatform = await Listing.aggregate([
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $ne: ['$active', false] }, 1, 0] } }
        }
      }
    ])
    
    // Annonces récentes (dernières 24h)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    
    const recentListings = await Listing.countDocuments({
      created_at: { $gte: oneDayAgo }
    })
    
    const stats = {
      total: totalListings,
      active: activeListings,
      inactive: inactiveListings,
      recent: recentListings,
      byPlatform
    }
    
    log(`📊 Statistiques: ${stats.total} total, ${stats.active} actives, ${stats.inactive} inactives, ${stats.recent} récentes`)
    
    return stats
    
  } catch (error) {
    log(`❌ Erreur lors de la récupération des statistiques: ${error.message}`)
    return null
  }
}

async function main() {
  const startTime = new Date()
  log(`🚀 Début du cron de cleanup standalone - ${startTime.toISOString()}`)
  
  try {
    await connectDB()
    
    // 1. Vérifier et supprimer les annonces 404
    const statusResults = await checkAndRemove404Listings()
    
    // 2. Supprimer les anciennes annonces
    const oldListingsRemoved = await removeOldListings()
    
    // 3. Afficher les statistiques
    const stats = await getCleanupStats()
    
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    
    log(`🎉 Cleanup terminé avec succès en ${duration}ms`)
    log(`📊 Résumé: ${statusResults.removed} 404 supprimées, ${oldListingsRemoved} anciennes supprimées`)
    
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
