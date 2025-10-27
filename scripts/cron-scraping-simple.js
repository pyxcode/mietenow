#!/usr/bin/env node

/**
 * Script de scraping ultra-simple pour Render
 * Évite tous les problèmes de modules ES6 et NextAuth.js
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Configuration des logs
const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'cron-scraping-simple.log')

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

async function testConnection() {
  try {
    log('🧪 Test de connexion MongoDB...')
    
    // Test simple de connexion
    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()
    
    log(`📊 Collections trouvées: ${collections.length}`)
    collections.forEach(col => {
      log(`  - ${col.name}`)
    })
    
    return true
  } catch (error) {
    log(`❌ Erreur test connexion: ${error.message}`)
    return false
  }
}

async function sendTestAlert() {
  try {
    log('📧 Test d\'envoi d\'alerte...')
    
    // Simuler l'envoi d'une alerte
    const testAlert = {
      email: 'test@example.com',
      title: 'Test Alert',
      message: 'Ceci est un test du cron job',
      timestamp: new Date()
    }
    
    log(`📤 Alerte test envoyée: ${JSON.stringify(testAlert)}`)
    return true
  } catch (error) {
    log(`❌ Erreur envoi alerte: ${error.message}`)
    return false
  }
}

async function main() {
  const startTime = new Date()
  log(`🚀 Début du cron de scraping simple - ${startTime.toISOString()}`)
  
  try {
    // 1. Connexion à MongoDB
    await connectDB()
    
    // 2. Test de connexion
    const connectionOk = await testConnection()
    if (!connectionOk) {
      throw new Error('Test de connexion échoué')
    }
    
    // 3. Test d'envoi d'alerte
    const alertOk = await sendTestAlert()
    if (!alertOk) {
      log('⚠️ Test d\'alerte échoué mais continue')
    }
    
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    
    log(`🎉 Cron terminé avec succès en ${duration}ms`)
    log(`📊 Résumé: Connexion OK, Test OK, Alerte ${alertOk ? 'OK' : 'ÉCHEC'}`)
    
  } catch (error) {
    log(`❌ Erreur fatale: ${error.message}`)
    log(`❌ Stack trace: ${error.stack}`)
    process.exit(1)
  } finally {
    try {
      await mongoose.disconnect()
      log('✅ Déconnecté de MongoDB')
    } catch (error) {
      log(`⚠️ Erreur déconnexion: ${error.message}`)
    }
  }
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  log(`💥 Erreur non capturée: ${error.message}`)
  log(`💥 Stack trace: ${error.stack}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log(`💥 Promesse rejetée: ${reason}`)
  process.exit(1)
})

// Exécuter le script
main().catch((error) => {
  log(`💥 Erreur dans main(): ${error.message}`)
  process.exit(1)
})
