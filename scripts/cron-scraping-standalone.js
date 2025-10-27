#!/usr/bin/env node

/**
 * Script de scraping standalone qui ne dépend pas du serveur Next.js
 * Utilise directement les scrapers sans passer par l'API
 */

// Logs de démarrage détaillés
console.log('🚀 Démarrage du script cron-scraping-standalone.js')
console.log('📁 Répertoire de travail:', process.cwd())
console.log('🔧 Node version:', process.version)
console.log('🌍 Environnement:', process.env.NODE_ENV || 'development')

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

console.log('📦 Modules de base chargés')

// Charger les variables d'environnement
try {
  require('dotenv').config({ path: '.env.local' })
  console.log('✅ Variables d\'environnement chargées')
} catch (error) {
  console.log('⚠️ Erreur chargement .env.local:', error.message)
}

// Vérifier les variables critiques
console.log('🔍 Vérification des variables d\'environnement:')
console.log('  - MONGODB_URI:', process.env.MONGODB_URI ? '✅ Définie' : '❌ Manquante')
console.log('  - APIKEYSENDGRID:', process.env.APIKEYSENDGRID ? '✅ Définie' : '❌ Manquante')

// Importer les scrapers directement
let ScraperManager
try {
  console.log('📦 Tentative de chargement des scrapers...')
  const scraperModule = require('../lib/scrapers/core/scraper-manager.js')
  ScraperManager = scraperModule.ScraperManager
  console.log('✅ ScraperManager chargé avec succès')
} catch (error) {
  console.log('❌ Erreur chargement ScraperManager:', error.message)
  console.log('❌ Stack trace:', error.stack)
  process.exit(1)
}

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
    // Utiliser la variable d'environnement MONGODB_URI
    const mongoUri = process.env.MONGODB_URI
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined')
    }
    
    // Si c'est une URI mongodb+srv://, la convertir en mongodb:// direct
    let connectionUri = mongoUri
    if (mongoUri.includes('mongodb+srv://')) {
      const match = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/)
      if (match) {
        const [, username, password, host, database, query] = match
        connectionUri = `mongodb://${username}:${password}@${host}:27017/${database}${query || ''}`
      }
    }
    
    await mongoose.connect(connectionUri)
    log('✅ Connecté à MongoDB - Base: mietenow-prod')
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

async function sendAlerts() {
  try {
    log('📧 Envoi des alertes aux utilisateurs...')
    
    // Importer le modèle Alert
    const Alert = require('./models/Alert.js')
    
    // Récupérer toutes les alertes actives
    const alerts = await Alert.find({ is_active: true })
    log(`📬 ${alerts.length} alertes actives trouvées`)
    
    let emailsSent = 0
    
    for (const alert of alerts) {
      try {
        // Simuler l'envoi d'email (vous pouvez intégrer SendGrid ici)
        log(`📤 Envoi d'alerte pour: ${alert.email} - ${alert.title}`)
        
        // TODO: Intégrer SendGrid pour l'envoi réel des emails
        // const sgMail = require('@sendgrid/mail')
        // sgMail.setApiKey(process.env.APIKEYSENDGRID)
        
        emailsSent++
      } catch (error) {
        log(`❌ Erreur envoi alerte ${alert.email}: ${error.message}`)
      }
    }
    
    log(`✅ ${emailsSent} alertes envoyées`)
    return emailsSent
    
  } catch (error) {
    log(`❌ Erreur lors de l'envoi des alertes: ${error.message}`)
    throw error
  }
}

async function main() {
  const startTime = new Date()
  log(`🚀 Début du cron de scraping standalone - ${startTime.toISOString()}`)
  
  try {
    log('🔗 Étape 1: Connexion à MongoDB...')
    await connectDB()
    log('✅ Connexion MongoDB réussie')
    
    log('🔍 Étape 2: Vérification des statuts des annonces...')
    const statusResults = await checkListingStatuses()
    log(`✅ Statuts vérifiés: ${statusResults.checked} annonces`)
    
    log('🕷️ Étape 3: Lancement du scraping...')
    const scrapingResults = await runScraping()
    log(`✅ Scraping terminé: ${scrapingResults} résultats`)
    
    log('📧 Étape 4: Envoi des alertes...')
    const emailsSent = await sendAlerts()
    log(`✅ Alertes envoyées: ${emailsSent}`)
    
    log('🧹 Étape 5: Nettoyage des anciennes annonces...')
    const cleanupCount = await cleanupOldListings()
    log(`✅ Nettoyage terminé: ${cleanupCount} annonces supprimées`)
    
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    
    log(`🎉 Cron terminé avec succès en ${duration}ms`)
    log(`📊 Résumé: ${statusResults.checked} vérifiées, ${statusResults.removed} supprimées, ${emailsSent} alertes envoyées, ${cleanupCount} anciennes supprimées`)
    
  } catch (error) {
    log(`❌ Erreur fatale: ${error.message}`)
    log(`❌ Stack trace: ${error.stack}`)
    console.error('💥 ERREUR FATALE:', error)
    process.exit(1)
  } finally {
    try {
      await mongoose.disconnect()
      log('✅ Déconnecté de MongoDB')
    } catch (disconnectError) {
      log(`⚠️ Erreur déconnexion MongoDB: ${disconnectError.message}`)
    }
  }
}

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
  console.error('💥 ERREUR NON CAPTURÉE:', error.message)
  console.error('💥 Stack trace:', error.stack)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 PROMESSE REJETÉE:', reason)
  process.exit(1)
})

// Exécuter le script
main().catch((error) => {
  console.error('💥 ERREUR DANS MAIN():', error.message)
  console.error('💥 Stack trace:', error.stack)
  process.exit(1)
})
