#!/usr/bin/env node

/**
 * Script de scraping hybride - Utilise Browserless pour Chrome, API pour le reste
 */

// Logs de démarrage détaillés
console.log('🚀 Démarrage du script cron-scraping-hybrid.js v1.0')
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
console.log('  - BROWSERLESS_TOKEN:', process.env.BROWSERLESS_TOKEN ? '✅ Définie' : '❌ Manquante')
console.log('  - APIKEYSENDGRID:', process.env.APIKEYSENDGRID ? '✅ Définie' : '❌ Manquante')

// Importer le ScraperManager hybride
let ScraperManagerHybrid
try {
  console.log('📦 Tentative de chargement du ScraperManager hybride...')
  const scraperModule = require('../lib/scrapers/core/scraper-manager-hybrid.js')
  ScraperManagerHybrid = scraperModule.ScraperManagerHybrid
  console.log('✅ ScraperManagerHybrid chargé avec succès')
} catch (error) {
  console.log('❌ Erreur chargement ScraperManagerHybrid:', error.message)
  console.log('❌ Stack trace:', error.stack)
  process.exit(1)
}

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'cron-scraping-hybrid.log')

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

// MongoDB Connection
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set.')
    }

    // Convertir mongodb+srv en mongodb pour connexion directe si nécessaire
    const finalMongoUri = mongoUri.startsWith('mongodb+srv://')
      ? mongoUri.replace('mongodb+srv://', 'mongodb://')
      : mongoUri

    await mongoose.connect(finalMongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    log(`✅ Connecté à MongoDB - Base: ${mongoose.connection.name}`)
  } catch (error) {
    log(`❌ Erreur connexion MongoDB: ${error.message}`)
    throw error
  }
}

// Fonction principale de scraping
async function runScraping() {
  try {
    log('🕷️ Lancement du scraping hybride...')
    
    const scraperManager = new ScraperManagerHybrid()
    const results = await scraperManager.scrapeAll()
    
    log(`✅ Scraping terminé: ${results.total} annonces trouvées`)
    
    // Log des résultats par plateforme
    for (const [platform, data] of Object.entries(results.platforms)) {
      log(`📊 ${platform}: ${data.found} annonces`)
    }
    
    return results
  } catch (error) {
    log(`❌ Erreur lors du scraping: ${error.message}`)
    throw error
  }
}

// Fonction principale
async function main() {
  const startTime = new Date()
  log(`🚀 Début du cron de scraping hybride - ${startTime.toISOString()}`)

  try {
    log('🔗 Étape 1: Connexion à MongoDB...')
    await connectDB()
    log('✅ Connexion MongoDB réussie')

    log('🕷️ Étape 2: Lancement du scraping hybride...')
    const scrapingResults = await runScraping()
    log(`✅ Scraping terminé: ${scrapingResults.total} annonces trouvées`)

    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()

    log(`🎉 Cron terminé avec succès en ${duration}ms`)
    log(`📊 Résumé: ${scrapingResults.total} annonces trouvées`)

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

// Gestion globale des erreurs
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
