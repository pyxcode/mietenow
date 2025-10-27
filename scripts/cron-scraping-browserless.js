/**
 * Script de scraping avec Browserless.io pour Render
 * Utilise Chrome distant - plus fiable et économique
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Logs de démarrage détaillés
console.log('🚀 Démarrage du script cron-scraping-browserless.js v1.0')
console.log('📁 Répertoire de travail:', process.cwd())
console.log('🔧 Node version:', process.version)
console.log('🌍 Environnement:', process.env.NODE_ENV || 'development')

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

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'cron-scraping-browserless.log')

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

// Connexion MongoDB
async function connectDB() {
  try {
    let mongoUri = process.env.MONGODB_URI
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined')
    }
    
    // Convertir mongodb+srv:// en mongodb:// pour la connexion directe
    if (mongoUri.startsWith('mongodb+srv://')) {
      mongoUri = mongoUri.replace('mongodb+srv://', 'mongodb://')
    }
    
    await mongoose.connect(mongoUri)
    log(`✅ Connecté à MongoDB - Base: ${mongoose.connection.db.databaseName}`)
  } catch (error) {
    log(`❌ Erreur connexion MongoDB: ${error.message}`)
    throw error
  }
}

// Fonction de scraping avec Browserless
async function runBrowserlessScraping() {
  try {
    log('🚀 Démarrage du scraping avec Browserless...')
    
    // Importer le scraper Browserless
    const { BrowserlessScraper } = require('./browserless-scraper.js')
    const scraper = new BrowserlessScraper()
    
    // Faire le scraping
    const listings = await scraper.scrapeAll()
    
    // Sauvegarder les annonces
    const savedCount = await scraper.saveListings(listings)
    
    const results = {
      total: listings.length,
      platforms: {
        "immobilienScout24": {
          found: listings.filter(l => l.platform === 'immobilienScout24').length,
          saved: savedCount,
          listings: listings.filter(l => l.platform === 'immobilienScout24')
        },
        "wg-gesucht": {
          found: listings.filter(l => l.platform === 'wg-gesucht').length,
          saved: savedCount,
          listings: listings.filter(l => l.platform === 'wg-gesucht')
        }
      },
      timestamp: new Date().toISOString()
    }
    
    log(`✅ Scraping Browserless terminé: ${savedCount}/${listings.length} annonces sauvegardées`)
    return results
    
  } catch (error) {
    log(`❌ Erreur lors du scraping Browserless: ${error.message}`)
    throw error
  }
}

// Fonction principale
async function main() {
  const startTime = new Date()
  log(`🚀 Début du cron de scraping Browserless - ${startTime.toISOString()}`)
  
  try {
    log('🔗 Étape 1: Connexion à MongoDB...')
    await connectDB()
    log('✅ Connexion MongoDB réussie')
    
    log('🕷️ Étape 2: Lancement du scraping Browserless...')
    const scrapingResults = await runBrowserlessScraping()
    log(`✅ Scraping terminé: ${scrapingResults.platforms['immobilienScout24'].found + scrapingResults.platforms['wg-gesucht'].found} annonces trouvées`)
    
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    
    log(`🎉 Cron terminé avec succès en ${duration}ms`)
    log(`📊 Résumé: ${scrapingResults.platforms['immobilienScout24'].found} ImmobilienScout24, ${scrapingResults.platforms['wg-gesucht'].found} WG-Gesucht`)
    
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
